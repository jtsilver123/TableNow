/**
 * Centralised, typed access to environment configuration.
 *
 * Everything is optional — the app runs in demo mode when nothing is set.
 * `isSupabaseEnabled` is the single switch the data layer reads to decide
 * between the live backend and the in-browser demo store.
 */
export const env = {
  useSupabase:
    process.env.NEXT_PUBLIC_USE_SUPABASE === "true" &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
};

export const isSupabaseEnabled = env.useSupabase;
