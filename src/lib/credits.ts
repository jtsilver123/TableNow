import type { User } from "./types";

/**
 * Credit rules — the heart of the trust model.
 *
 *   "1 credit is used only when we successfully book your table."
 *
 * - New users get 1 free credit at signup.
 * - The first successful reservation is free.
 * - After the free credit is used, a user needs >= 1 credit to ACTIVATE.
 * - A credit is consumed only on a confirmed booking.
 * - Failed / expired / canceled / paused requests cost 0 credits.
 */

/** Can this user activate auto-booking (purely on credit grounds)? */
export function canActivate(user: Pick<User, "credit_balance" | "free_credit_used">): boolean {
  if (!user.free_credit_used) return true; // first booking is free
  return user.credit_balance >= 1;
}

/** Will activating a request require the user to hold a paid credit? */
export function requiresCredit(user: Pick<User, "free_credit_used">): boolean {
  return user.free_credit_used;
}

/** Standard, reusable credit reassurance copy. */
export const CREDIT_COPY = "1 credit is used only when we successfully book your table.";

export const FREE_CREDIT_COPY = "Your first successful booking is free.";

/**
 * Resolve the credit a successful booking should consume.
 *
 * Returns whether a paid credit is consumed and whether the free credit is now
 * spent. Used inside the (atomic) booking-success transaction so credit
 * consumption can never be duplicated.
 */
export function resolveBookingCredit(
  user: Pick<User, "credit_balance" | "free_credit_used">,
): { useFreeCredit: boolean; consumePaidCredit: boolean; ok: boolean } {
  if (!user.free_credit_used) {
    return { useFreeCredit: true, consumePaidCredit: false, ok: true };
  }
  if (user.credit_balance >= 1) {
    return { useFreeCredit: false, consumePaidCredit: true, ok: true };
  }
  // Should never happen — active requests require eligibility — but guard anyway
  // so we mark the booking for manual review rather than consume a phantom credit.
  return { useFreeCredit: false, consumePaidCredit: false, ok: false };
}
