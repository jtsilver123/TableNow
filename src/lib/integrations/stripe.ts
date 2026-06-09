/**
 * Stripe subscription integration — stubbed for the MVP.
 *
 * The Plan page calls `startCheckout()` to upgrade to Premium. With no Stripe
 * keys configured this resolves to a local "demo" outcome so the plan flips
 * immediately. Once STRIPE_SECRET_KEY + the Premium price ID are set, swap the
 * body of `createCheckoutSession` to create a real Stripe Checkout Session
 * (mode: "subscription") and redirect to its URL. The webhook then flips the
 * user to Premium on `checkout.session.completed`.
 */

export interface CheckoutResult {
  mode: "stripe" | "demo";
  url?: string;
}

export function premiumPriceId(): string | undefined {
  return process.env.STRIPE_PRICE_PREMIUM;
}

/**
 * Server-side: create a Stripe subscription Checkout Session. Stubbed until
 * keys exist.
 *
 * Real implementation outline:
 *   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
 *   const session = await stripe.checkout.sessions.create({
 *     mode: "subscription",
 *     line_items: [{ price: premiumPriceId(), quantity: 1 }],
 *     metadata: { userId },
 *     success_url: `${appUrl}/plan?status=success`,
 *     cancel_url: `${appUrl}/plan?status=cancel`,
 *   });
 *   return { mode: "stripe", url: session.url! };
 */
export async function createCheckoutSession(_userId: string): Promise<CheckoutResult> {
  const configured = Boolean(process.env.STRIPE_SECRET_KEY && premiumPriceId());
  if (!configured) return { mode: "demo" };
  // TODO: replace with a real Stripe Checkout Session once keys are configured.
  return { mode: "demo" };
}
