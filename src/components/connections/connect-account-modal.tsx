"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { CloseButton, Modal } from "@/components/ui/overlay";
import { PlatformBadge } from "@/components/ui/platform-logo";
import { LogoMark } from "@/components/ui/logo";
import { CheckIcon } from "@/components/icons";
import { PLATFORM_LABEL } from "@/lib/status";
import { useStore } from "@/lib/store";
import type { Platform } from "@/lib/types";

type Step = "consent" | "authorizing" | "done";

/**
 * Simulated OAuth-style connection handshake.
 *
 * Mirrors how a real, approved integration would feel: the user authorizes
 * through the provider and grants scopes — we never see or store a password.
 * Today this is a faithful stand-in wired to the adapter layer; an approved
 * provider flow can replace the middle step without changing this UI.
 */
export function ConnectAccountModal({
  provider,
  onClose,
}: {
  provider: Platform | null;
  onClose: () => void;
}) {
  const connectAccount = useStore((s) => s.connectAccount);
  const [step, setStep] = useState<Step>("consent");
  const [email, setEmail] = useState("");

  // Reset whenever a new connection flow opens.
  useEffect(() => {
    if (provider) {
      setStep("consent");
      setEmail("");
    }
  }, [provider]);

  if (!provider) return null;
  const label = PLATFORM_LABEL[provider];

  function authorize() {
    if (!email.trim()) return;
    setStep("authorizing");
    // Simulate the provider redirect + token exchange.
    setTimeout(() => {
      setStep("done");
      setTimeout(() => {
        connectAccount(provider!, email.trim());
        onClose();
      }, 700);
    }, 1300);
  }

  return (
    <Modal open={Boolean(provider)} onClose={onClose} className="max-w-md">
      <div className="absolute right-4 top-4">
        <CloseButton onClick={onClose} />
      </div>

      <div className="px-6 py-8">
        {/* Provider header — feels like an authorization screen */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-3">
            <LogoMark className="h-11 w-11" />
            <span className="text-ink-300">···</span>
            <PlatformBadge platform={provider} className="h-11 w-11 text-lg" />
          </div>
        </div>

        {step === "consent" && (
          <>
            <h2 className="mt-6 text-center font-serif text-2xl text-ink-900">
              Connect your {label} account
            </h2>
            <p className="mt-2 text-center text-sm text-ink-500">
              You authorize through {label} directly. We never see or store your password.
            </p>

            <div className="mt-6 rounded-xl border border-line bg-ivory-100 p-4">
              <p className="eyebrow mb-3">TableNow will be able to</p>
              <ul className="space-y-2.5 text-[13px] text-ink-700">
                {[
                  "View availability for restaurants you request",
                  "Make reservations on your behalf when a match opens",
                  "Read your confirmed bookings",
                ].map((scope) => (
                  <li key={scope} className="flex items-start gap-2">
                    <CheckIcon className="mt-0.5 h-4 w-4 flex-none text-sage-600" />
                    {scope}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5">
              <Label htmlFor="acct-email">Your {label} account email</Label>
              <Input
                id="acct-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && authorize()}
                placeholder="you@example.com"
                autoFocus
              />
            </div>

            <Button size="lg" className="mt-5 w-full" onClick={authorize} disabled={!email.trim()}>
              Authorize {label}
            </Button>
            <p className="mt-3 text-center text-[11px] text-ink-400">
              You can disconnect at any time. We book only with your own profile.
            </p>
          </>
        )}

        {step === "authorizing" && (
          <div className="flex flex-col items-center py-8 text-center">
            <span className="mb-4 h-2 w-2 animate-pulse-soft rounded-full bg-sage-500" />
            <p className="text-sm text-ink-600">Authorizing with {label}…</p>
            <p className="mt-1 text-[12px] text-ink-400">Securely exchanging your authorization.</p>
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center py-8 text-center animate-fade-up">
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sage-500 text-ivory-50">
              <CheckIcon className="h-6 w-6" />
            </span>
            <p className="font-serif text-xl text-ink-900">{label} connected</p>
            <p className="mt-1 text-[13px] text-ink-400">{email}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
