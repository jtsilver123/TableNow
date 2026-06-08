"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { env } from "@/lib/env";
import { signInWithGoogle } from "@/lib/supabase/client";
import { useStore } from "@/lib/store";

function GoogleG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 18" className={className} aria-hidden>
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
    </svg>
  );
}

/**
 * "Continue with Google". Uses Supabase OAuth when configured; otherwise it
 * runs the local demo so the experience works everywhere today.
 */
export function GoogleButton({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const login = useStore((s) => s.login);
  const signup = useStore((s) => s.signup);
  const pushToast = useStore((s) => s.pushToast);
  const [busy, setBusy] = useState(false);

  async function handle() {
    setBusy(true);
    const base = env.appUrl || (typeof window !== "undefined" ? window.location.origin : "");
    const res = await signInWithGoogle(`${base}/queue`);
    if (res.demo) {
      // No Supabase backend configured — fall back to the local demo.
      if (mode === "login") {
        login();
        router.push("/queue");
      } else {
        signup("Google Guest", "guest@gmail.com");
        router.push("/onboarding");
      }
      pushToast("info", "Signed in (demo). Connect Supabase to enable real Google sign-in.");
    } else if (!res.ok) {
      pushToast("warning", res.error ?? "Could not start Google sign-in.");
      setBusy(false);
    }
    // On success with Supabase, the browser is redirecting to Google.
  }

  return (
    <Button variant="secondary" size="lg" className="w-full" onClick={handle} disabled={busy}>
      <GoogleG className="h-[18px] w-[18px]" />
      Continue with Google
    </Button>
  );
}
