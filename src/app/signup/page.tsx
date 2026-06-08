"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { GoogleButton } from "@/components/auth/google-button";
import { useStore } from "@/lib/store";

export default function SignupPage() {
  const router = useRouter();
  const signup = useStore((s) => s.signup);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    signup(name.trim(), email.trim());
    router.push("/onboarding");
  }

  return (
    <AuthShell>
      <p className="eyebrow mb-3">Create your account</p>
      <h2 className="text-3xl">Your first booking is on us.</h2>
      <p className="mt-2 text-sm text-ink-500">
        Sign up and receive 1 free credit — enough for your first successful reservation.
      </p>

      <div className="mt-8">
        <GoogleButton mode="signup" />
      </div>
      <div className="my-5 flex items-center gap-3 text-[12px] text-ink-400">
        <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Rivera" autoFocus />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <Button type="submit" size="lg" className="w-full">
          Get your first booking free
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Already a member?{" "}
        <Link href="/login" className="font-medium text-sage-600 hover:text-sage-700">
          Sign in
        </Link>
      </p>
      <p className="mt-6 text-center text-[11px] leading-relaxed text-ink-400">
        By continuing you agree to our compliant-use terms. We book only with your connected
        account and never resell reservations.
      </p>
    </AuthShell>
  );
}
