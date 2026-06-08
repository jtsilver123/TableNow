"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { useStore } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const login = useStore((s) => s.login);
  const [email, setEmail] = useState("alex@example.com");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    login();
    router.push("/queue");
  }

  return (
    <AuthShell>
      <p className="eyebrow mb-3">Welcome back</p>
      <h2 className="text-3xl">Sign in to your concierge.</h2>
      <p className="mt-2 text-sm text-ink-500">
        This demo signs you into a sample account so you can explore the full experience.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
        </div>
        <div>
          <Label htmlFor="password" hint="Demo — any value works">Password</Label>
          <Input id="password" type="password" defaultValue="demo" />
        </div>
        <Button type="submit" size="lg" className="w-full">
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        New here?{" "}
        <Link href="/signup" className="font-medium text-sage-600 hover:text-sage-700">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
