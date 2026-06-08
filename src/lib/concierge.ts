import type { Flexibility, Platform, ReservationRequest } from "./types";

/**
 * Concierge parser.
 *
 * NOT a general chatbot. It only helps with: creating requests, editing
 * requests, explaining status, suggesting broader criteria, and pointing at
 * credits/connections. This is a deterministic, rule-based parser standing in
 * for an LLM — the structured output shape is what matters and can be produced
 * by a real model later without changing the UI.
 */

export type ConciergeIntent =
  | { kind: "create"; draft: ConciergeDraft; followUp?: string }
  | { kind: "edit_flexibility"; restaurantHint: string; flexibility: Flexibility }
  | { kind: "pause"; filterHint: string }
  | { kind: "explain_credits" }
  | { kind: "explain_status"; restaurantHint?: string }
  | { kind: "help" };

export interface ConciergeDraft {
  restaurant_name?: string;
  platform?: Platform;
  party_size?: number;
  date_start?: string;
  date_end?: string;
  time_start?: string;
  time_end?: string;
  flexibility_level?: Flexibility;
  city?: string;
}

const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

/** Known restaurants help the parser anchor the name; unknowns still work. */
const KNOWN = [
  "don angie",
  "tatiana",
  "cote",
  "lilia",
  "carbone",
  "rezdora",
  "i sodi",
  "4 charles",
  "torrisi",
  "the river cafe",
];

function nextWeekdayDate(targetDow: number, from = new Date(), allowToday = false): Date {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  let delta = (targetDow - d.getDay() + 7) % 7;
  if (delta === 0 && !allowToday) delta = 7;
  d.setDate(d.getDate() + delta);
  return d;
}

function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function parseTime(raw: string): string | undefined {
  // "7", "7pm", "7:30", "19:00", "6 and 9"
  const m = raw.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (!m) return undefined;
  let h = Number(m[1]);
  const min = m[2] ?? "00";
  const period = m[3]?.toLowerCase();
  if (period === "pm" && h < 12) h += 12;
  if (period === "am" && h === 12) h = 0;
  // Dinner heuristic: a bare "7" means evening.
  if (!period && h <= 11) h += 12;
  return `${String(h).padStart(2, "0")}:${min}`;
}

/** Main entry: turn a user message into a structured intent. */
export function parseConciergeMessage(message: string, now = new Date()): ConciergeIntent {
  const text = message.toLowerCase().trim();

  // --- Non-create intents first ---
  if (/\bwhich\b.*\bcredit/.test(text) || /need(s)? credit/.test(text)) {
    return { kind: "explain_credits" };
  }
  if (/\bpause\b/.test(text)) {
    return { kind: "pause", filterHint: text.replace(/.*pause/, "").trim() || "all" };
  }
  if (/(easier|more flexible|broaden|widen|loosen)/.test(text)) {
    const restaurantHint = matchRestaurant(text) ?? "";
    return { kind: "edit_flexibility", restaurantHint, flexibility: "very_flexible" };
  }
  if (/^(help|what can you|how does this)/.test(text)) {
    return { kind: "help" };
  }

  // --- Create / try a request ---
  const isCreate = /(book|try|get|reserve|grab|want|table at|find me)/.test(text);
  const draft: ConciergeDraft = {};

  const restaurant = matchRestaurant(text);
  if (restaurant) draft.restaurant_name = restaurant;

  // Party size: "for 2", "party of 4", "2 people"
  const party = text.match(/(?:for|party of|of)\s+(\d{1,2})|(\d{1,2})\s*(?:people|guests|pax)/);
  if (party) draft.party_size = Number(party[1] ?? party[2]);

  // Date hints
  if (/this weekend/.test(text)) {
    draft.date_start = iso(nextWeekdayDate(6, now, true));
    draft.date_end = iso(nextWeekdayDate(0, now));
    draft.flexibility_level = "flexible";
  } else if (/next week/.test(text)) {
    const start = nextWeekdayDate(1, now); // next Monday
    const end = new Date(start);
    end.setDate(end.getDate() + 4); // through Friday
    draft.date_start = iso(start);
    draft.date_end = iso(end);
    draft.flexibility_level = "very_flexible";
  } else {
    for (let i = 0; i < WEEKDAYS.length; i++) {
      if (text.includes(WEEKDAYS[i])) {
        const d = iso(nextWeekdayDate(i, now));
        draft.date_start = d;
        draft.date_end = d;
        break;
      }
    }
  }

  // Time window: "after 7", "between 6 and 9", "at 8"
  const between = text.match(/between\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s+and\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/);
  if (between) {
    draft.time_start = parseTime(between[1]);
    draft.time_end = parseTime(between[2]);
  } else {
    const after = text.match(/after\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/);
    const at = text.match(/(?:at|around)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/);
    if (after) {
      draft.time_start = parseTime(after[1]);
      const start = Number(draft.time_start?.split(":")[0] ?? 19);
      draft.time_end = `${String(Math.min(start + 2, 23)).padStart(2, "0")}:00`;
    } else if (at) {
      const t = parseTime(at[1]);
      if (t) {
        draft.time_start = t;
        const start = Number(t.split(":")[0]);
        draft.time_end = `${String(Math.min(start + 1, 23)).padStart(2, "0")}:30`;
      }
    }
  }

  if (!isCreate && !restaurant) {
    return { kind: "help" };
  }

  // Decide on a single concise follow-up if essentials are missing.
  let followUp: string | undefined;
  if (!draft.restaurant_name) followUp = "Which restaurant would you like?";
  else if (!draft.party_size) followUp = "What party size should I use?";
  else if (!draft.date_start) followUp = "Should I search a specific night or a range?";
  else if (!draft.time_start) followUp = "What time window works for you?";

  return { kind: "create", draft, followUp };
}

function matchRestaurant(text: string): string | undefined {
  for (const name of KNOWN) {
    if (text.includes(name)) {
      return name.replace(/\b\w/g, (c) => c.toUpperCase());
    }
  }
  // Heuristic: "book me X for" / "try X any"
  const m = text.match(/(?:book me|try|reserve|get me|table at)\s+([a-z][a-z'&\s]+?)(?:\s+(?:for|any|on|next|this|between|after|at|tonight|tomorrow)\b|$)/);
  if (m) {
    const cand = m[1].trim();
    if (cand.length > 1) return cand.replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return undefined;
}

/** Build a human confirmation line from a draft. */
export function draftToSummary(draft: ConciergeDraft): string {
  const parts: string[] = [];
  if (draft.restaurant_name) parts.push(draft.restaurant_name);
  if (draft.party_size) parts.push(`for ${draft.party_size}`);
  return parts.join(" ") || "your request";
}

/** Merge a parsed draft onto sensible request defaults. */
export function draftToRequestDefaults(
  draft: ConciergeDraft,
  defaults: { city: string; party_size: number },
): Partial<ReservationRequest> {
  return {
    restaurant_name: draft.restaurant_name,
    platform: draft.platform ?? "resy",
    city: draft.city ?? defaults.city,
    party_size: draft.party_size ?? defaults.party_size,
    date_start: draft.date_start,
    date_end: draft.date_end ?? draft.date_start,
    time_start: draft.time_start ?? "19:00",
    time_end: draft.time_end ?? "21:00",
    flexibility_level: draft.flexibility_level ?? "flexible",
    seating_preference: "any",
    priority: "normal",
  };
}
