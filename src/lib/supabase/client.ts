"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, isSupabaseEnabled } from "../env";

/**
 * Lazily-created Supabase browser client.
 *
 * Returns null in demo mode (no Supabase env configured), which lets the UI
 * fall back to the local store. Once NEXT_PUBLIC_SUPABASE_URL/ANON_KEY are set
 * (and NEXT_PUBLIC_USE_SUPABASE=true), this becomes the real auth + data client.
 */
let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseEnabled) return null;
  if (!client) {
    client = createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return client;
}

export interface OAuthResult {
  /** True when no Supabase backend is configured — caller should demo-fallback. */
  demo: boolean;
  ok: boolean;
  error?: string;
}

/** Begin Google OAuth. Redirects to Google when Supabase is configured. */
export async function signInWithGoogle(redirectTo: string): Promise<OAuthResult> {
  const sb = getSupabase();
  if (!sb) return { demo: true, ok: false };
  const { error } = await sb.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });
  return { demo: false, ok: !error, error: error?.message };
}
