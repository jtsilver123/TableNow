import { getAdapter } from "./adapters";
import type { AdapterReason } from "./adapters/types";
import { bookingDeepLink } from "./deep-link";
import { ATTEMPT_STATUS_LABEL, PLATFORM_LABEL } from "./status";
import {
  FREE_WATCH_LIMIT,
  type AttemptStatus,
  type Booking,
  type BookingAttempt,
  type NotificationType,
  type ReservationRequest,
  type RequestStatus,
  type User,
} from "./types";

/**
 * Core watch workflow — platform-agnostic.
 *
 * Given a watch (reservation_request), this performs ONE availability check via
 * the platform adapter. If a matching table is found, it records the opening
 * with a one-tap booking deep link and alerts the user — the product never
 * books on the user's behalf. If nothing matches, it keeps watching.
 *
 * Pure: returns a description of the changes to apply. The caller persists them.
 */

export interface WatchCheckInput {
  request: ReservationRequest;
  user: User;
  now?: number;
  checkIntervalMinutes?: number;
}

export interface WatchCheckResult {
  attempt: BookingAttempt;
  requestPatch: Partial<ReservationRequest>;
  /** Created when a matching table is found. */
  booking?: Booking;
  notification?: { type: NotificationType };
  summary: string;
}

let counter = 0;
function id(prefix: string): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

function makeAttempt(
  request: ReservationRequest,
  status: AttemptStatus,
  iso: string,
  message?: string,
): BookingAttempt {
  return {
    id: id("att"),
    reservation_request_id: request.id,
    platform: request.platform,
    status,
    message: message ?? `Checked ${PLATFORM_LABEL[request.platform]}. ${ATTEMPT_STATUS_LABEL[status]}.`,
    checked_at: iso,
    created_at: iso,
  };
}

function reasonToAttemptStatus(reason: AdapterReason | undefined): AttemptStatus {
  if (
    reason === "account_disconnected" ||
    reason === "integration_unavailable" ||
    reason === "invalid_request"
  ) {
    return "connection_failed";
  }
  return reason === "match_found" ? "match_found" : "checked_no_match";
}

export async function runWatchCheck(input: WatchCheckInput): Promise<WatchCheckResult> {
  const { request, user } = input;
  const now = input.now ?? Date.now();
  const iso = new Date(now).toISOString();
  const interval = input.checkIntervalMinutes ?? (user.plan === "premium" ? 1 : 2);
  const nextCheck = new Date(now + interval * 60_000).toISOString();

  const base: Partial<ReservationRequest> = {
    last_checked_at: iso,
    next_check_at: nextCheck,
    updated_at: iso,
  };

  // Expiry.
  if (request.expires_at && new Date(request.expires_at).getTime() < now) {
    return {
      attempt: makeAttempt(request, "checked_no_match", iso, "Watch window has passed."),
      requestPatch: { ...base, status: "expired", next_check_at: null },
      notification: { type: "request_expired" },
      summary: "Watch expired. We stopped checking.",
    };
  }

  // Check availability via the platform adapter.
  const adapter = getAdapter(request.platform);
  const availability = await adapter.searchAvailability(request);

  if (!availability.available) {
    const attemptStatus = reasonToAttemptStatus(availability.reason);
    const connectionFailed = attemptStatus === "connection_failed";
    return {
      attempt: makeAttempt(
        request,
        attemptStatus,
        iso,
        availability.message,
      ),
      requestPatch: {
        ...base,
        status: connectionFailed ? "needs_connection" : "active",
        next_check_at: connectionFailed ? null : nextCheck,
      },
      notification: connectionFailed ? { type: "connection_issue" } : undefined,
      summary: connectionFailed
        ? "Live availability needs attention. We paused this watch."
        : "No table yet. Still watching.",
    };
  }

  // Match found — record the opening + deep link, and alert. We do NOT book.
  const slot = availability.slots[0];
  const booking: Booking = {
    id: id("found"),
    user_id: user.id,
    reservation_request_id: request.id,
    restaurant_name: request.restaurant_name,
    platform: request.platform,
    date: slot?.date ?? request.date_start,
    time: slot?.time ?? request.time_start,
    party_size: slot?.partySize ?? request.party_size,
    book_url:
      slot?.bookUrl ??
      bookingDeepLink({
        platform: request.platform,
        restaurant_name: request.restaurant_name,
        city: request.city,
        party_size: slot?.partySize ?? request.party_size,
        date_start: slot?.date ?? request.date_start,
        time_start: slot?.time ?? request.time_start,
      }),
    status: "found",
    found_at: iso,
    created_at: iso,
    updated_at: iso,
  };

  return {
    attempt: makeAttempt(request, "match_found", iso, `Found a table — ${PLATFORM_LABEL[request.platform]}. Alert sent.`),
    requestPatch: { ...base, status: "booked", auto_book_enabled: false, next_check_at: null },
    booking,
    notification: { type: "booking_success" },
    summary: "Table found! We sent you a one-tap booking link.",
  };
}

/**
 * Resolve whether a watch can start, given the user's plan and how many active
 * watches they already run. Free members are capped; Premium is unlimited.
 */
export function resolveActivation(
  user: Pick<User, "plan">,
  activeWatchCount: number,
): { status: RequestStatus; activated: boolean; reason?: string } {
  if (user.plan === "free" && activeWatchCount >= FREE_WATCH_LIMIT) {
    return {
      status: "needs_credits",
      activated: false,
      reason: `Free includes ${FREE_WATCH_LIMIT} active watches. Upgrade to Premium for unlimited.`,
    };
  }
  return { status: "active", activated: true };
}
