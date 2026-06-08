import type {
  AttemptStatus,
  Flexibility,
  Platform,
  Priority,
  RequestStatus,
  SeatingPreference,
} from "./types";

/**
 * Presentation metadata for request statuses. Keeping copy + visual treatment
 * in one place ensures the queue, drawer, and calendar all speak the same
 * calm, trustworthy language.
 */

export type StatusTone = "neutral" | "active" | "success" | "warning" | "muted";

interface StatusMeta {
  label: string;
  /** Short card microcopy. */
  micro: string;
  tone: StatusTone;
}

export const REQUEST_STATUS_META: Record<RequestStatus, StatusMeta> = {
  draft: { label: "Draft", micro: "Saved as draft", tone: "neutral" },
  active: { label: "Active", micro: "Searching", tone: "active" },
  booked: { label: "Booked", micro: "Booked", tone: "success" },
  needs_credits: { label: "Needs credits", micro: "Needs credits", tone: "warning" },
  needs_connection: { label: "Needs connection", micro: "Needs connection", tone: "warning" },
  paused: { label: "Paused", micro: "Paused", tone: "muted" },
  expired: { label: "Expired", micro: "Expired", tone: "muted" },
  failed: { label: "Failed", micro: "No credit used", tone: "muted" },
  canceled: { label: "Canceled", micro: "Canceled", tone: "muted" },
};

/** Tailwind classes for a status pill, by tone. */
export const TONE_PILL: Record<StatusTone, string> = {
  neutral: "bg-ivory-200 text-ink-600 ring-1 ring-line",
  active: "bg-sage-100 text-sage-700 ring-1 ring-sage-200",
  success: "bg-sage-500 text-ivory-50 ring-1 ring-sage-600",
  warning: "bg-clay-100 text-clay-600 ring-1 ring-clay-200",
  muted: "bg-ivory-200 text-ink-400 ring-1 ring-line",
};

/** Small dot that prefixes a status, by tone. */
export const TONE_DOT: Record<StatusTone, string> = {
  neutral: "bg-ink-300",
  active: "bg-sage-500 animate-pulse-soft",
  success: "bg-sage-500",
  warning: "bg-clay-500",
  muted: "bg-ink-300",
};

export const ATTEMPT_STATUS_LABEL: Record<AttemptStatus, string> = {
  checked_no_match: "No matching table",
  match_found: "Found matching table",
  booking_started: "Booking started",
  booking_succeeded: "Booking succeeded",
  booking_failed: "Booking failed — no credit used",
  connection_failed: "Connection issue",
  request_locked: "Already in progress",
  duplicate_prevented: "Duplicate prevented",
};

export const PLATFORM_LABEL: Record<Platform, string> = {
  resy: "Resy",
  opentable: "OpenTable",
};

export const FLEXIBILITY_LABEL: Record<Flexibility, string> = {
  strict: "Strict",
  flexible: "Flexible",
  very_flexible: "Very flexible",
};

export const SEATING_LABEL: Record<SeatingPreference, string> = {
  any: "Any seating",
  indoor: "Indoor",
  outdoor: "Outdoor",
  bar: "Bar",
  counter: "Counter",
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  normal: "Normal",
  high: "High",
};

/** Order used for status filter chips in the queue. */
export const STATUS_FILTER_ORDER: RequestStatus[] = [
  "draft",
  "active",
  "booked",
  "needs_credits",
  "needs_connection",
  "paused",
  "expired",
  "failed",
];
