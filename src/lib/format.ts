import type { ReservationRequest } from "./types";

/** Formatting helpers shared across the UI. Calm, human, never technical. */

const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Parse a YYYY-MM-DD string as a local date (no timezone surprises). */
export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function formatDate(iso: string): string {
  const d = parseDate(iso);
  return `${DAY[d.getDay()]}, ${MONTH[d.getMonth()]} ${d.getDate()}`;
}

/** Render a request's date as a single day or a range. */
export function formatDateRange(req: Pick<ReservationRequest, "date_start" | "date_end">): string {
  if (req.date_start === req.date_end) return formatDate(req.date_start);
  const a = parseDate(req.date_start);
  const b = parseDate(req.date_end);
  if (a.getMonth() === b.getMonth()) {
    return `${MONTH[a.getMonth()]} ${a.getDate()}–${b.getDate()}`;
  }
  return `${MONTH[a.getMonth()]} ${a.getDate()} – ${MONTH[b.getMonth()]} ${b.getDate()}`;
}

/** "7:00" (24h) -> "7:00 PM". */
export function formatTime(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(":");
  let h = Number(hStr);
  const m = mStr ?? "00";
  const period = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${m} ${period}`;
}

export function formatTimeWindow(
  req: Pick<ReservationRequest, "time_start" | "time_end">,
): string {
  return `${formatTime(req.time_start)} – ${formatTime(req.time_end)}`;
}

export function formatPartySize(n: number): string {
  return `${n} ${n === 1 ? "guest" : "guests"}`;
}

/** Relative time like "2 min ago" / "in 3 min". */
export function formatRelative(iso: string | null, now = Date.now()): string {
  if (!iso) return "—";
  const diff = new Date(iso).getTime() - now;
  const abs = Math.abs(diff);
  const mins = Math.round(abs / 60000);
  const future = diff > 0;
  let value: string;
  if (mins < 1) value = "just now";
  else if (mins < 60) value = `${mins} min`;
  else if (mins < 1440) value = `${Math.round(mins / 60)} hr`;
  else value = `${Math.round(mins / 1440)} day${Math.round(mins / 1440) === 1 ? "" : "s"}`;
  if (value === "just now") return value;
  return future ? `in ${value}` : `${value} ago`;
}

export function formatMoney(cents: number): string {
  return `$${(cents / 1).toLocaleString("en-US")}`;
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${MONTH[d.getMonth()]} ${d.getDate()}, ${formatTime(
    `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`,
  )}`;
}
