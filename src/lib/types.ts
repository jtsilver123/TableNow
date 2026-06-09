/**
 * Core domain types for TableNow.
 *
 * These mirror the D1 schema (see workers/schema.sql) so the same shapes flow
 * from the database, through the platform adapters, and into the UI.
 */

export type Platform = "resy" | "opentable";

export type Flexibility = "strict" | "flexible" | "very_flexible";

export type SeatingPreference = "any" | "indoor" | "outdoor" | "bar" | "counter";

export type Priority = "normal" | "high";

/** Free vs Premium plan. */
export type Plan = "free" | "premium";

/** How many active watches a free member may run at once. */
export const FREE_WATCH_LIMIT = 3;

/** Lifecycle of an auto-booking request. */
export type RequestStatus =
  | "draft"
  | "active"
  | "booked"
  | "needs_credits"
  | "needs_connection"
  | "paused"
  | "expired"
  | "failed"
  | "canceled";

/** Each entry in a request's attempt timeline. */
export type AttemptStatus =
  | "checked_no_match"
  | "match_found"
  | "booking_started"
  | "booking_succeeded"
  | "booking_failed"
  | "connection_failed"
  | "request_locked"
  | "duplicate_prevented";

/** A found opening is live ("found") until its slot passes ("expired"). */
export type BookingStatus = "found" | "expired";

export type CreditTransactionType =
  | "signup_bonus"
  | "purchase"
  | "booking_success"
  | "refund"
  | "admin_adjustment";

export type ConnectionStatus = "connected" | "disconnected" | "needs_reconnect";

export interface User {
  id: string;
  name: string;
  email: string;
  plan: Plan;
  default_city: string;
  default_party_size: number;
  created_at: string;
  updated_at: string;
}

export interface ConnectedAccount {
  id: string;
  user_id: string;
  provider: Platform;
  status: ConnectionStatus;
  account_label: string | null;
  last_checked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReservationRequest {
  id: string;
  user_id: string;
  restaurant_name: string;
  platform: Platform;
  city: string;
  neighborhood?: string;
  party_size: number;
  date_start: string; // ISO date (YYYY-MM-DD)
  date_end: string; // ISO date — equals date_start for a single day
  time_start: string; // HH:MM (24h)
  time_end: string; // HH:MM (24h)
  flexibility_level: Flexibility;
  seating_preference: SeatingPreference;
  priority: Priority;
  status: RequestStatus;
  credit_required: boolean;
  auto_book_enabled: boolean;
  notes?: string;
  expires_at: string | null;
  last_checked_at: string | null;
  next_check_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * A table our monitor found for the user. The product never books — it surfaces
 * the opening with a deep link so the user grabs it themselves in one tap.
 */
export interface Booking {
  id: string;
  user_id: string;
  reservation_request_id: string;
  restaurant_name: string;
  platform: Platform;
  date: string;
  time: string;
  party_size: number;
  /** One-tap deep link to the platform's booking page for this opening. */
  book_url: string;
  status: BookingStatus;
  /** When the opening was detected and the user alerted. */
  found_at: string;
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  type: CreditTransactionType;
  amount: number; // positive = credit added, negative = credit consumed
  reason: string;
  booking_id: string | null;
  created_at: string;
}

export interface BookingAttempt {
  id: string;
  reservation_request_id: string;
  platform: Platform;
  status: AttemptStatus;
  message: string;
  checked_at: string;
  created_at: string;
}

export type ConciergeRole = "user" | "assistant";

export interface ConciergeMessage {
  id: string;
  user_id: string;
  role: ConciergeRole;
  content: string;
  /** Structured request draft the concierge proposes, if any. */
  structured_payload: Partial<ReservationRequest> | null;
  created_at: string;
}

export type NotificationType =
  | "booking_success"
  | "request_expired"
  | "request_paused"
  | "needs_credits"
  | "connection_issue";

export interface AppNotification {
  id: string;
  user_id: string;
  reservation_request_id: string | null;
  type: NotificationType;
  channel: "email";
  status: "queued" | "sent" | "failed";
  sent_at: string | null;
  created_at: string;
}

export interface PlanTier {
  id: Plan;
  name: string;
  price: number; // monthly, USD
  tagline: string;
  features: string[];
}

export const PLANS: PlanTier[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    tagline: "Start watching the tables you want most.",
    features: [
      `Up to ${FREE_WATCH_LIMIT} active table watches`,
      "Email alerts the moment a table opens",
      "One-tap link to book on Resy or OpenTable",
      "Standard check frequency",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 19,
    tagline: "For people who never want to miss the table.",
    features: [
      "Unlimited active watches",
      "Priority, high-frequency checks",
      "Widest flexibility — date ranges, multiple time windows",
      "SMS alerts (coming soon)",
      "Early access to new restaurants",
    ],
  },
];
