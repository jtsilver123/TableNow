import type { Platform, ReservationRequest } from "../types";
import type {
  AvailabilityResult,
  AvailabilitySlot,
  BookingResult,
  BookingStatusResult,
  ConnectionResult,
  MockScenario,
  PlatformAdapter,
} from "./types";

/**
 * Shared mock adapter behaviour.
 *
 * Both MockResyAdapter and MockOpenTableAdapter extend this. It simulates every
 * scenario the spec calls for — no availability, a match, a successful booking,
 * a failed booking, a disconnected account, an unavailable restaurant, and a
 * time-window mismatch — using a deterministic hash so a given request behaves
 * consistently across checks (until it eventually "opens up").
 */

/** Restaurants the mock treats as fully booked / unavailable. */
const UNAVAILABLE_RESTAURANTS = ["the closed table", "ghost kitchen"];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export abstract class MockPlatformAdapter implements PlatformAdapter {
  abstract readonly provider: Platform;

  /** Optional forced scenario, used by demos/tests. */
  constructor(protected readonly forcedScenario?: MockScenario) {}

  async validateConnection(userId: string): Promise<ConnectionResult> {
    if (this.forcedScenario === "account_disconnected") {
      return { connected: false, message: "Account disconnected. Please reconnect." };
    }
    return {
      connected: true,
      accountLabel: `${this.provider}-${userId.slice(0, 6)}`,
      message: "Connection healthy.",
    };
  }

  async searchAvailability(request: ReservationRequest): Promise<AvailabilityResult> {
    const scenario = this.forcedScenario ?? this.deriveScenario(request);

    if (scenario === "account_disconnected") {
      return { available: false, slots: [], reason: "account_disconnected" };
    }
    if (scenario === "restaurant_unavailable") {
      return { available: false, slots: [], reason: "restaurant_unavailable" };
    }
    if (scenario === "time_window_mismatch") {
      return { available: false, slots: [], reason: "time_window_mismatch" };
    }
    if (scenario === "no_availability") {
      return { available: false, slots: [], reason: "no_availability" };
    }

    // match_found / successful_booking / failed_booking all surface a match.
    return {
      available: true,
      slots: [this.buildSlot(request)],
      reason: "match_found",
    };
  }

  async attemptBooking(request: ReservationRequest): Promise<BookingResult> {
    const scenario = this.forcedScenario ?? this.deriveScenario(request);

    if (scenario === "account_disconnected") {
      return { success: false, reason: "account_disconnected", message: "Account disconnected." };
    }
    if (scenario === "failed_booking") {
      return {
        success: false,
        reason: "booking_failed",
        message: "The table was claimed before we could confirm. No credit used.",
      };
    }
    if (
      scenario === "no_availability" ||
      scenario === "restaurant_unavailable" ||
      scenario === "time_window_mismatch"
    ) {
      return { success: false, reason: scenario, message: "No matching table to book." };
    }

    const slot = this.buildSlot(request);
    return {
      success: true,
      confirmationNumber: this.confirmationNumber(request),
      bookedSlot: slot,
      message: `Booked ${request.restaurant_name} for ${slot.partySize} at ${slot.time}.`,
    };
  }

  async getBookingStatus(bookingId: string): Promise<BookingStatusResult> {
    return { status: "confirmed", message: `Booking ${bookingId} is confirmed.` };
  }

  async cancelBooking(bookingId: string): Promise<BookingStatusResult> {
    return { status: "canceled", message: `Booking ${bookingId} canceled.` };
  }

  /**
   * Deterministically pick a scenario from the request so behaviour is stable
   * across repeated checks, but varied across requests.
   */
  protected deriveScenario(request: ReservationRequest): MockScenario {
    if (UNAVAILABLE_RESTAURANTS.includes(request.restaurant_name.trim().toLowerCase())) {
      return "restaurant_unavailable";
    }
    const seed = hashString(`${this.provider}:${request.id}:${request.restaurant_name}`);
    // Very-flexible requests are far likelier to find a match.
    const matchBias =
      request.flexibility_level === "very_flexible"
        ? 70
        : request.flexibility_level === "flexible"
          ? 50
          : 32;
    const roll = seed % 100;
    if (roll < matchBias) return "successful_booking";
    if (roll < matchBias + 8) return "failed_booking";
    if (roll < matchBias + 14) return "time_window_mismatch";
    return "no_availability";
  }

  protected buildSlot(request: ReservationRequest): AvailabilitySlot {
    return {
      date: request.date_start,
      time: request.time_start,
      seating: request.seating_preference === "any" ? "dining room" : request.seating_preference,
      partySize: request.party_size,
    };
  }

  protected confirmationNumber(request: ReservationRequest): string {
    const prefix = this.provider === "resy" ? "RSY" : "OPT";
    const n = hashString(request.id).toString().slice(0, 7).padStart(7, "0");
    return `${prefix}-${n}`;
  }
}
