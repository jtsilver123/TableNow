type Platform = "resy" | "opentable";

interface WatchRequest {
  restaurant_name: string;
  platform: Platform;
  provider_venue_id?: string;
  city: string;
  party_size: number;
  date_start: string;
  date_end: string;
  time_start: string;
  time_end: string;
  seating_preference: "any" | "indoor" | "outdoor" | "bar" | "counter";
}

interface AvailabilitySlot {
  date: string;
  time: string;
  seating: string;
  partySize: number;
  bookUrl?: string;
}

interface AvailabilityResult {
  available: boolean;
  slots: AvailabilitySlot[];
  reason?:
    | "no_availability"
    | "match_found"
    | "restaurant_unavailable"
    | "integration_unavailable"
    | "invalid_request";
  message?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

let openTableTokenCache: { value: string; expiresAt: number } | null = null;

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return json({ message: "Method not allowed." }, 405);
  }
  if (
    Deno.env.get("ALLOW_ANONYMOUS_AVAILABILITY") !== "true" &&
    jwtRole(request.headers.get("Authorization")) !== "authenticated"
  ) {
    return json(
      {
        available: false,
        slots: [],
        reason: "integration_unavailable",
        message: "Sign in before running live availability checks.",
      },
      401,
    );
  }

  try {
    const body = await request.json();
    if (body.action === "health") {
      return health(body.provider);
    }
    if (body.action !== "search" || !body.request) {
      return json({ message: "Expected a search action and request." }, 400);
    }

    const watch = body.request as WatchRequest;
    const validation = validateWatch(watch);
    if (validation) return json(validation);

    const result =
      watch.platform === "opentable"
        ? await searchOpenTable(watch)
        : await searchResyPartner(watch);
    return json(result);
  } catch (error) {
    console.error(error);
    return json(
      {
        available: false,
        slots: [],
        reason: "integration_unavailable",
        message: "The availability gateway could not complete this check.",
      },
      500,
    );
  }
});

function health(provider: Platform) {
  if (provider === "opentable") {
    const connected = Boolean(
      Deno.env.get("OPENTABLE_CLIENT_ID") &&
        Deno.env.get("OPENTABLE_CLIENT_SECRET") &&
        Deno.env.get("OPENTABLE_API_BASE_URL"),
    );
    return json({
      available: false,
      slots: [],
      connected,
      accountLabel: connected ? "OpenTable Partner API" : undefined,
      message: connected
        ? "OpenTable live availability is configured."
        : "OpenTable partner credentials are not configured.",
    });
  }

  const connected = Boolean(Deno.env.get("RESY_PARTNER_AVAILABILITY_URL"));
  return json({
    available: false,
    slots: [],
    connected,
    accountLabel: connected ? "Resy approved partner endpoint" : undefined,
    message: connected
      ? "Resy partner availability is configured."
      : "Resy requires an approved partner availability endpoint.",
  });
}

function validateWatch(watch: WatchRequest): AvailabilityResult | null {
  if (!watch || !["resy", "opentable"].includes(watch.platform)) {
    return invalid("Choose Resy or OpenTable for this watch.");
  }
  if (!watch.provider_venue_id?.trim()) {
    return invalid(`Add the ${watch.platform === "resy" ? "Resy venue ID" : "OpenTable RID"} for this restaurant.`);
  }
  if (
    !watch.restaurant_name ||
    !watch.date_start ||
    !watch.date_end ||
    !watch.time_start ||
    !watch.time_end ||
    !Number.isInteger(watch.party_size) ||
    watch.party_size < 1
  ) {
    return invalid("The watch is missing required restaurant, date, time, or party-size information.");
  }
  return null;
}

function invalid(message: string): AvailabilityResult {
  return { available: false, slots: [], reason: "invalid_request", message };
}

async function searchOpenTable(watch: WatchRequest): Promise<AvailabilityResult> {
  const apiBase = Deno.env.get("OPENTABLE_API_BASE_URL")?.replace(/\/$/, "");
  if (!apiBase) {
    return unavailable("OpenTable API base URL is not configured.");
  }

  const token = await getOpenTableToken();
  if (!token) {
    return unavailable("OpenTable OAuth credentials are missing or were rejected.");
  }

  const dates = datesBetween(
    watch.date_start,
    watch.date_end,
    Number(Deno.env.get("MAX_DATES_PER_CHECK") ?? "7"),
  );
  const slots: AvailabilitySlot[] = [];

  for (const date of dates) {
    const query = new URLSearchParams({
      start_date_time: `${date}T${roundDownToQuarter(watch.time_start)}`,
      forward_minutes: String(windowMinutes(watch.time_start, watch.time_end)),
      party_size: String(watch.party_size),
      include_credit_card_results: "true",
      include_experiences: "true",
    });
    const attribute = openTableAttribute(watch.seating_preference);
    if (attribute) query.set("require_attributes", attribute);

    const response = await fetch(
      `${apiBase}/v2/availability/${encodeURIComponent(watch.provider_venue_id!)}?${query}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (response.status === 401) {
      openTableTokenCache = null;
      return unavailable("OpenTable rejected the access token. Check the partner credentials.");
    }
    if (response.status === 404) {
      return {
        available: false,
        slots: [],
        reason: "restaurant_unavailable",
        message: "OpenTable could not find that restaurant RID.",
      };
    }
    if (!response.ok) {
      return unavailable(`OpenTable availability returned HTTP ${response.status}.`);
    }

    const payload = await response.json();
    slots.push(...extractOpenTableSlots(payload, date, watch));
    if (slots.length > 0) break;
  }

  return slots.length
    ? {
        available: true,
        slots: slots.slice(0, 20),
        reason: "match_found",
        message: `Found ${slots.length} matching OpenTable opening${slots.length === 1 ? "" : "s"}.`,
      }
    : {
        available: false,
        slots: [],
        reason: "no_availability",
        message: "No matching OpenTable opening yet.",
      };
}

async function getOpenTableToken(): Promise<string | null> {
  if (openTableTokenCache && openTableTokenCache.expiresAt > Date.now() + 60_000) {
    return openTableTokenCache.value;
  }

  const clientId = Deno.env.get("OPENTABLE_CLIENT_ID");
  const clientSecret = Deno.env.get("OPENTABLE_CLIENT_SECRET");
  const oauthBase = (Deno.env.get("OPENTABLE_OAUTH_BASE_URL") ?? "https://oauth.opentable.com").replace(
    /\/$/,
    "",
  );
  if (!clientId || !clientSecret) return null;

  const response = await fetch(`${oauthBase}/api/v2/oauth/token?grant_type=client_credentials`, {
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) return null;

  const payload = await response.json();
  if (typeof payload.access_token !== "string") return null;
  openTableTokenCache = {
    value: payload.access_token,
    expiresAt: Date.now() + Number(payload.expires_in ?? 3600) * 1000,
  };
  return openTableTokenCache.value;
}

async function searchResyPartner(watch: WatchRequest): Promise<AvailabilityResult> {
  const endpoint = Deno.env.get("RESY_PARTNER_AVAILABILITY_URL");
  if (!endpoint) {
    return unavailable(
      "Resy does not provide a public diner availability API. Configure an approved Resy partner endpoint.",
    );
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  const token = Deno.env.get("RESY_PARTNER_API_TOKEN");
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ action: "search", provider: "resy", request: watch }),
  });
  if (!response.ok) {
    return unavailable(`The approved Resy partner endpoint returned HTTP ${response.status}.`);
  }

  const payload = (await response.json()) as Partial<AvailabilityResult>;
  const slots = Array.isArray(payload.slots) ? payload.slots : [];
  return {
    available: payload.available ?? slots.length > 0,
    slots,
    reason: payload.reason ?? (slots.length ? "match_found" : "no_availability"),
    message: payload.message ?? (slots.length ? "Found a matching Resy opening." : "No matching Resy opening yet."),
  };
}

function extractOpenTableSlots(
  payload: Record<string, unknown>,
  fallbackDate: string,
  watch: WatchRequest,
): AvailabilitySlot[] {
  const slots: AvailabilitySlot[] = [];
  const details = Array.isArray(payload.times_available) ? payload.times_available : [];

  for (const value of details) {
    if (!isRecord(value)) continue;
    const rawTime = firstString(value, ["date_time", "start_date_time", "time"]);
    if (!rawTime) continue;
    const normalized = normalizeDateTime(rawTime, fallbackDate);
    if (!withinWindow(normalized.time, watch.time_start, watch.time_end)) continue;

    const attributes = Array.isArray(value.attributes)
      ? value.attributes.filter((item): item is string => typeof item === "string")
      : [];
    const rawUrl = firstString(value, ["booking_url", "booking_restref_url"]);
    slots.push({
      date: normalized.date,
      time: normalized.time,
      seating: attributes.join(", ") || "dining room",
      partySize: watch.party_size,
      bookUrl: rawUrl ? withOpenTableReferral(rawUrl) : undefined,
    });
  }

  if (slots.length === 0 && Array.isArray(payload.times)) {
    for (const value of payload.times) {
      if (typeof value !== "string") continue;
      const normalized = normalizeDateTime(value, fallbackDate);
      if (!withinWindow(normalized.time, watch.time_start, watch.time_end)) continue;
      slots.push({
        date: normalized.date,
        time: normalized.time,
        seating: watch.seating_preference === "any" ? "dining room" : watch.seating_preference,
        partySize: watch.party_size,
      });
    }
  }

  return slots;
}

function withOpenTableReferral(rawUrl: string): string {
  const referralId = Deno.env.get("OPENTABLE_REFERRAL_ID");
  if (!referralId) return rawUrl;
  try {
    const url = new URL(rawUrl);
    url.searchParams.set("ref", referralId);
    return url.toString();
  } catch {
    return rawUrl;
  }
}

function datesBetween(start: string, end: string, rawLimit: number): string[] {
  const limit = Math.min(Math.max(Number.isFinite(rawLimit) ? rawLimit : 7, 1), 31);
  const cursor = new Date(`${start}T12:00:00Z`);
  const last = new Date(`${end}T12:00:00Z`);
  const dates: string[] = [];
  while (cursor <= last && dates.length < limit) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

function openTableAttribute(preference: WatchRequest["seating_preference"]): string | null {
  if (preference === "any") return null;
  if (preference === "indoor") return "default";
  return preference;
}

function roundDownToQuarter(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  return `${String(hours).padStart(2, "0")}:${String(Math.floor(minutes / 15) * 15).padStart(2, "0")}`;
}

function windowMinutes(start: string, end: string): number {
  return Math.min(Math.max(toMinutes(end) - toMinutes(start), 15), 720);
}

function withinWindow(time: string, start: string, end: string): boolean {
  const value = toMinutes(time);
  return value >= toMinutes(start) && value <= toMinutes(end);
}

function toMinutes(time: string): number {
  const [hours, minutes] = time.slice(0, 5).split(":").map(Number);
  return hours * 60 + minutes;
}

function normalizeDateTime(value: string, fallbackDate: string): { date: string; time: string } {
  const match = value.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/);
  if (match) return { date: match[1], time: match[2] };
  const time = value.match(/(\d{2}:\d{2})/)?.[1] ?? value.slice(0, 5);
  return { date: fallbackDate, time };
}

function firstString(value: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    if (typeof value[key] === "string") return value[key] as string;
  }
  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function unavailable(message: string): AvailabilityResult {
  return { available: false, slots: [], reason: "integration_unavailable", message };
}

function jwtRole(authorization: string | null): string | null {
  const token = authorization?.replace(/^Bearer\s+/i, "");
  const payload = token?.split(".")[1];
  if (!payload) return null;
  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const decoded = JSON.parse(atob(padded));
    return typeof decoded.role === "string" ? decoded.role : null;
  } catch {
    return null;
  }
}

function json(payload: object, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
