import { env } from "../env";
import { getSupabase } from "../supabase/client";
import type { Platform, ReservationRequest } from "../types";
import type {
  AvailabilityResult,
  BookingResult,
  BookingStatusResult,
  ConnectionResult,
  PlatformAdapter,
} from "./types";

interface GatewayResponse extends AvailabilityResult {
  connected?: boolean;
  accountLabel?: string;
}

/**
 * Live availability adapter.
 *
 * Provider credentials stay in the server-side availability gateway. The
 * static frontend sends only a watch definition and receives normalized slots.
 */
export class LiveAvailabilityAdapter implements PlatformAdapter {
  constructor(readonly provider: Platform) {}

  async validateConnection(_userId: string): Promise<ConnectionResult> {
    const result = await this.callGateway({ action: "health", provider: this.provider });
    return {
      connected: result.connected ?? false,
      accountLabel: result.accountLabel,
      message: result.message ?? "Live availability connection unavailable.",
    };
  }

  async searchAvailability(request: ReservationRequest): Promise<AvailabilityResult> {
    return this.callGateway({ action: "search", request });
  }

  async attemptBooking(_request: ReservationRequest): Promise<BookingResult> {
    return {
      success: false,
      reason: "integration_unavailable",
      message: "TableNow alerts only. Complete the reservation on the provider.",
    };
  }

  async getBookingStatus(_bookingId: string): Promise<BookingStatusResult> {
    return { status: "unknown", message: "Booking status is managed by the provider." };
  }

  async cancelBooking(_bookingId: string): Promise<BookingStatusResult> {
    return { status: "unknown", message: "Cancel the reservation with the provider." };
  }

  private async callGateway(body: object): Promise<GatewayResponse> {
    if (!env.availabilityApiUrl || !env.availabilityApiKey) {
      return {
        available: false,
        slots: [],
        connected: false,
        reason: "integration_unavailable",
        message: "Live availability is enabled, but the gateway is not configured.",
      };
    }

    try {
      const session = await getSupabase()?.auth.getSession();
      const accessToken = session?.data.session?.access_token ?? env.availabilityApiKey;
      const response = await fetch(env.availabilityApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: env.availabilityApiKey,
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });
      const payload = (await response.json()) as Partial<GatewayResponse>;

      if (!response.ok) {
        return {
          available: false,
          slots: [],
          connected: false,
          reason: payload.reason ?? "integration_unavailable",
          message: payload.message ?? `Availability gateway returned HTTP ${response.status}.`,
        };
      }

      return {
        available: payload.available ?? false,
        slots: payload.slots ?? [],
        connected: payload.connected,
        accountLabel: payload.accountLabel,
        reason: payload.reason,
        message: payload.message,
      };
    } catch {
      return {
        available: false,
        slots: [],
        connected: false,
        reason: "integration_unavailable",
        message: "Could not reach the live availability gateway.",
      };
    }
  }
}
