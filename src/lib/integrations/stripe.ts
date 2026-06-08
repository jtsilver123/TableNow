import { CREDIT_PACKAGES } from "@/lib/types";

/**
 * Stripe checkout integration — stubbed for the MVP.
 *
 * The UI calls `startCheckout()`. With no Stripe keys configured this resolves
 * to a local "demo" outcome so credits are granted immediately (see the store's
 * purchaseCredits). Once STRIPE_SECRET_KEY + price IDs are set, swap the body
 * of `createCheckoutSession` to create a real Stripe Checkout Session on the
 * server and redirect to its URL. A Stripe webhook (a Next.js route handler or
 * Supabase Edge Function) then credits the account on
 * `checkout.session.completed`.
 */

export interface CheckoutRequest {
  credits: number;
  label: string;
  userId: string;
}

export interface CheckoutResult {
  mode: "stripe" | "demo";
  url?: string;
}

const PRICE_ENV: Record<number, string | undefined> = {
  3: process.env.STRIPE_PRICE_CREDITS_3,
  10: process.env.STRIPE_PRICE_CREDITS_10,
  25: process.env.STRIPE_PRICE_CREDITS_25,
  50: process.env.STRIPE_PRICE_CREDITS_50,
};

export function priceIdFor(credits: number): string | undefined {
  return PRICE_ENV[credits];
}

/**
 * Server-side: create a Stripe Checkout Session. Stubbed until keys exist.
 *
 * Real implementation outline:
 *   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
 *   const session = await stripe.checkout.sessions.create({
 *     mode: "payment",
 *     line_items: [{ price: priceIdFor(req.credits), quantity: 1 }],
 *     metadata: { userId: req.userId, credits: String(req.credits) },
 *     success_url: `${appUrl}/credits?status=success`,
 *     cancel_url: `${appUrl}/credits?status=cancel`,
 *   });
 *   return { mode: "stripe", url: session.url! };
 */
export async function createCheckoutSession(req: CheckoutRequest): Promise<CheckoutResult> {
  const configured = Boolean(process.env.STRIPE_SECRET_KEY && priceIdFor(req.credits));
  if (!configured) {
    return { mode: "demo" };
  }
  // TODO: replace with a real Stripe Checkout Session once keys are configured.
  return { mode: "demo" };
}

export function isValidPackage(credits: number): boolean {
  return CREDIT_PACKAGES.some((p) => p.credits === credits);
}
