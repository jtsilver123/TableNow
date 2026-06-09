import type { Platform, ReservationRequest } from "../types";

/**
 * Platform adapter contract.
 *
 * The rest of the app never branches on Resy vs OpenTable — all
 * platform-specific behaviour stays behind this interface. Mock adapters ship
 * today; real, approved integrations can drop in later without touching the
 * booking workflow, queue, or UI.
 */

export interface AvailabilityResult {
  available: boolean;
  /** Concrete slots that match the request, if any. */
  slots: AvailabilitySlot[];
  /** Why nothing matched, for the attempt timeline. */
  reason?: AdapterReason;
  /** Human-readable provider or configuration detail. */
  message?: string;
}

export interface AvailabilitySlot {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  seating: string;
  partySize: number;
  /** Exact provider booking URL when the live API returns one. */
  bookUrl?: string;
}

export interface BookingResult {
  success: boolean;
  confirmationNumber?: string;
  bookedSlot?: AvailabilitySlot;
  reason?: AdapterReason;
  message: string;
}

export interface ConnectionResult {
  connected: boolean;
  accountLabel?: string;
  message: string;
}

export interface BookingStatusResult {
  status: "confirmed" | "canceled" | "manual_review" | "unknown";
  message: string;
}

export type AdapterReason =
  | "no_availability"
  | "match_found"
  | "booking_failed"
  | "account_disconnected"
  | "restaurant_unavailable"
  | "time_window_mismatch"
  | "integration_unavailable"
  | "invalid_request";

export interface PlatformAdapter {
  readonly provider: Platform;
  validateConnection(userId: string): Promise<ConnectionResult>;
  searchAvailability(request: ReservationRequest): Promise<AvailabilityResult>;
  attemptBooking(request: ReservationRequest): Promise<BookingResult>;
  getBookingStatus(bookingId: string): Promise<BookingStatusResult>;
  cancelBooking(bookingId: string): Promise<BookingStatusResult>;
}

/**
 * Deterministic scenario hook used by the mock adapters so demos and tests can
 * force a specific outcome. In production this is ignored entirely.
 */
export type MockScenario =
  | "no_availability"
  | "match_found"
  | "successful_booking"
  | "failed_booking"
  | "account_disconnected"
  | "restaurant_unavailable"
  | "time_window_mismatch";
