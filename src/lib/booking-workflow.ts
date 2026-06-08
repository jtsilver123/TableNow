import { getAdapter } from "./adapters";
import type { AdapterReason } from "./adapters/types";
import { resolveBookingCredit } from "./credits";
import { ATTEMPT_STATUS_LABEL, PLATFORM_LABEL } from "./status";
import type {
  AttemptStatus,
  Booking,
  BookingAttempt,
  ConnectedAccount,
  CreditTransaction,
  NotificationType,
  ReservationRequest,
  RequestStatus,
  User,
} from "./types";

/**
 * Core booking workflow — platform-agnostic.
 *
 * Given a request, the user, and their connections, this performs ONE booking
 * check: validate connection + credit eligibility, search availability via the
 * adapter, and if a match is found attempt the booking. On success it produces
 * a confirmed booking, consumes exactly one credit (or the free credit), and
 * emits a notification. On failure it logs an attempt and keeps the request
 * active. It never consumes a credit unless a booking is confirmed.
 *
 * The function is PURE: it returns a description of the changes to apply. The
 * caller (client store simulation, or the Cloudflare queue consumer holding a
 * Durable Object lock) is responsible for atomically persisting them.
 */

export interface BookingCheckInput {
  request: ReservationRequest;
  user: User;
  connection: ConnectedAccount | undefined;
  now?: number;
  /** Minutes until the next scheduled check. */
  checkIntervalMinutes?: number;
}

export interface BookingCheckResult {
  attempt: BookingAttempt;
  /** Patch to apply to the request. */
  requestPatch: Partial<ReservationRequest>;
  /** Created on a successful, confirmed booking. */
  booking?: Booking;
  /** Credit ledger entry for a successful booking. */
  creditTransaction?: CreditTransaction;
  /** Patch to apply to the user (credit balance / free credit flags). */
  userPatch?: Partial<User>;
  notification?: { type: NotificationType };
  /** Human summary, handy for logs/UI toasts. */
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
  switch (reason) {
    case "account_disconnected":
      return "connection_failed";
    case "match_found":
      return "match_found";
    default:
      return "checked_no_match";
  }
}

export async function runBookingCheck(input: BookingCheckInput): Promise<BookingCheckResult> {
  const { request, user, connection } = input;
  const now = input.now ?? Date.now();
  const iso = new Date(now).toISOString();
  const interval = input.checkIntervalMinutes ?? 2;
  const nextCheck = new Date(now + interval * 60_000).toISOString();

  const baseRequestPatch: Partial<ReservationRequest> = {
    last_checked_at: iso,
    next_check_at: nextCheck,
    updated_at: iso,
  };

  // 1. Connection check.
  if (!connection || connection.status !== "connected") {
    return {
      attempt: makeAttempt(
        request,
        "connection_failed",
        iso,
        `${PLATFORM_LABEL[request.platform]} account needs to be connected.`,
      ),
      requestPatch: { ...baseRequestPatch, status: "needs_connection", next_check_at: null },
      notification: { type: "connection_issue" },
      summary: "Connection needed — paused until reconnected.",
    };
  }

  // 2. Credit eligibility.
  const eligible = !user.free_credit_used || user.credit_balance >= 1;
  if (!eligible) {
    return {
      attempt: makeAttempt(request, "checked_no_match", iso, "Paused — no credits available."),
      requestPatch: { ...baseRequestPatch, status: "needs_credits", next_check_at: null },
      notification: { type: "needs_credits" },
      summary: "Out of credits — needs credits to continue.",
    };
  }

  // 3. Expiry.
  if (request.expires_at && new Date(request.expires_at).getTime() < now) {
    return {
      attempt: makeAttempt(request, "checked_no_match", iso, "Request window has passed."),
      requestPatch: { ...baseRequestPatch, status: "expired", next_check_at: null },
      notification: { type: "request_expired" },
      summary: "Request expired. No credit used.",
    };
  }

  // 4. Search availability via the platform adapter.
  const adapter = getAdapter(request.platform);
  const availability = await adapter.searchAvailability(request);

  if (!availability.available) {
    if (availability.reason === "account_disconnected") {
      return {
        attempt: makeAttempt(request, "connection_failed", iso),
        requestPatch: { ...baseRequestPatch, status: "needs_connection", next_check_at: null },
        notification: { type: "connection_issue" },
        summary: "Connection dropped during check.",
      };
    }
    return {
      attempt: makeAttempt(request, reasonToAttemptStatus(availability.reason), iso),
      requestPatch: { ...baseRequestPatch, status: "active" },
      summary: "No matching table yet. Still searching.",
    };
  }

  // 5. Match found — attempt the booking.
  const booking = await adapter.attemptBooking(request);
  if (!booking.success) {
    // Failed booking never consumes a credit; request stays active.
    return {
      attempt: makeAttempt(request, "booking_failed", iso, booking.message),
      requestPatch: { ...baseRequestPatch, status: "active" },
      summary: "Booking attempt failed. No credit used.",
    };
  }

  // 6. Booking confirmed — consume exactly one credit (atomically, by caller).
  const credit = resolveBookingCredit(user);
  if (!credit.ok) {
    // Defensive: don't consume a phantom credit — flag for manual review.
    const bookingRecord: Booking = buildBooking(request, user, booking, iso, "manual_review", false);
    return {
      attempt: makeAttempt(request, "booking_succeeded", iso, "Booked — pending credit review."),
      requestPatch: { ...baseRequestPatch, status: "booked", auto_book_enabled: false, next_check_at: null },
      booking: bookingRecord,
      summary: "Booked, flagged for manual credit review.",
    };
  }

  const bookingRecord: Booking = buildBooking(request, user, booking, iso, "confirmed", true);

  const userPatch: Partial<User> = { updated_at: iso };
  let creditTransaction: CreditTransaction | undefined;
  if (credit.useFreeCredit) {
    userPatch.free_credit_used = true;
    creditTransaction = {
      id: id("ctx"),
      user_id: user.id,
      type: "booking_success",
      amount: 0,
      reason: "First successful booking — free credit",
      booking_id: bookingRecord.id,
      created_at: iso,
    };
  } else {
    userPatch.credit_balance = user.credit_balance - 1;
    creditTransaction = {
      id: id("ctx"),
      user_id: user.id,
      type: "booking_success",
      amount: -1,
      reason: `Successful booking at ${request.restaurant_name}`,
      booking_id: bookingRecord.id,
      created_at: iso,
    };
  }

  return {
    attempt: makeAttempt(request, "booking_succeeded", iso, booking.message),
    requestPatch: {
      ...baseRequestPatch,
      status: "booked",
      auto_book_enabled: false,
      next_check_at: null,
    },
    booking: bookingRecord,
    creditTransaction,
    userPatch,
    notification: { type: "booking_success" },
    summary: credit.useFreeCredit
      ? "Booked with your free credit."
      : "Booked. 1 credit used.",
  };
}

function buildBooking(
  request: ReservationRequest,
  user: User,
  result: Awaited<ReturnType<ReturnType<typeof getAdapter>["attemptBooking"]>>,
  iso: string,
  status: Booking["status"],
  creditUsed: boolean,
): Booking {
  const slot = result.bookedSlot;
  return {
    id: id("bkg"),
    user_id: user.id,
    reservation_request_id: request.id,
    restaurant_name: request.restaurant_name,
    platform: request.platform,
    date: slot?.date ?? request.date_start,
    time: slot?.time ?? request.time_start,
    party_size: slot?.partySize ?? request.party_size,
    confirmation_number: result.confirmationNumber ?? "PENDING",
    status,
    credit_used: creditUsed,
    booked_at: iso,
    created_at: iso,
    updated_at: iso,
  };
}

/**
 * Determine the activation status for a request when a user tries to activate.
 * Returns the status the request should take, plus whether activation succeeded.
 */
export function resolveActivation(
  request: ReservationRequest,
  user: User,
  connection: ConnectedAccount | undefined,
): { status: RequestStatus; activated: boolean; reason?: string } {
  if (!connection || connection.status !== "connected") {
    return { status: "needs_connection", activated: false, reason: "Connect your account to activate auto-booking." };
  }
  const eligible = !user.free_credit_used || user.credit_balance >= 1;
  if (!eligible) {
    return { status: "needs_credits", activated: false, reason: "Add credits to activate auto-booking." };
  }
  return { status: "active", activated: true };
}
