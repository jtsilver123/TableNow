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

export type BookingStatus = "confirmed" | "canceled" | "manual_review";

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
  credit_balance: number;
  free_credit_granted: boolean;
  free_credit_used: boolean;
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

export interface Booking {
  id: string;
  user_id: string;
  reservation_request_id: string;
  restaurant_name: string;
  platform: Platform;
  date: string;
  time: string;
  party_size: number;
  confirmation_number: string;
  status: BookingStatus;
  credit_used: boolean;
  booked_at: string;
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

export const CREDIT_PACKAGES = [
  { credits: 3, price: 60, label: "Taste" },
  { credits: 10, price: 180, label: "Regular", popular: true },
  { credits: 25, price: 400, label: "Connoisseur" },
  { credits: 50, price: 700, label: "Patron" },
] as const;

export type CreditPackage = (typeof CREDIT_PACKAGES)[number];
