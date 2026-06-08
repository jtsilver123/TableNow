"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { CheckIcon, CreditIcon } from "@/components/icons";
import { useHydrated } from "@/components/hydrated";
import { cn } from "@/lib/cn";
import { CREDIT_COPY } from "@/lib/credits";
import { CREDIT_PACKAGES } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { CreditTransaction, CreditTransactionType } from "@/lib/types";

const TYPE_LABEL: Record<CreditTransactionType, string> = {
  signup_bonus: "Signup bonus",
  purchase: "Purchase",
  booking_success: "Successful booking",
  refund: "Refund",
  admin_adjustment: "Adjustment",
};

export default function CreditsPage() {
  const hydrated = useHydrated();
  const user = useStore((s) => s.user);
  const transactions = useStore((s) => s.transactions);
  const attempts = useStore((s) => s.attempts);
  const purchaseCredits = useStore((s) => s.purchaseCredits);

  const failedFreeAttempts = useMemo(
    () => attempts.filter((a) => a.status === "booking_failed").length,
    [attempts],
  );

  const sorted = useMemo(
    () => [...transactions].sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [transactions],
  );

  return (
    <div className="mx-auto max-w-3xl px-5 py-7 sm:px-8">
      <p className="eyebrow mb-2">Credits</p>
      <h2 className="font-serif text-3xl text-ink-900">One credit, one booking.</h2>

      {/* Balance */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="card-surface flex items-center gap-4 p-6">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sage-100 text-sage-600">
            <CreditIcon className="h-6 w-6" />
          </span>
          <div>
            <p className="text-[12px] uppercase tracking-wide text-ink-400">Balance</p>
            <p className="font-serif text-3xl text-ink-900">{hydrated ? user.credit_balance : "—"}</p>
          </div>
        </div>
        <div className="card-surface flex flex-col justify-center p-6">
          <p className="text-[12px] uppercase tracking-wide text-ink-400">Free booking</p>
          <p className="mt-1 flex items-center gap-2 text-lg font-medium text-ink-900">
            {hydrated && !user.free_credit_used ? (
              <>
                <span className="h-2 w-2 rounded-full bg-sage-500" /> Available
              </>
            ) : (
              <span className="text-ink-500">Used</span>
            )}
          </p>
          <p className="mt-1 text-[12px] text-ink-400">Your first successful booking is free.</p>
        </div>
      </div>

      {/* Packages */}
      <section className="mt-10">
        <h3 className="font-serif text-2xl text-ink-900">Add credits</h3>
        <p className="mt-1 text-sm text-ink-500">{CREDIT_COPY}</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CREDIT_PACKAGES.map((pkg) => (
            <div
              key={pkg.credits}
              className={cn(
                "card-surface relative flex flex-col p-5",
                "popular" in pkg && pkg.popular && "ring-2 ring-sage-300",
              )}
            >
              {"popular" in pkg && pkg.popular && (
                <span className="absolute -top-2.5 left-5 rounded-full bg-sage-500 px-2.5 py-0.5 text-[10px] font-medium text-ivory-50">
                  Most popular
                </span>
              )}
              <p className="text-[12px] uppercase tracking-label text-sage-600">{pkg.label}</p>
              <p className="mt-2 font-serif text-4xl text-ink-900">{pkg.credits}</p>
              <p className="text-[13px] text-ink-400">credits</p>
              <hr className="rule my-4" />
              <p className="text-sm text-ink-600">
                <span className="font-medium text-ink-900">${pkg.price}</span>
                <span className="text-ink-400"> · ${Math.round(pkg.price / pkg.credits)}/credit</span>
              </p>
              <Button size="sm" className="mt-4 w-full" onClick={() => purchaseCredits(pkg.credits, pkg.label)}>
                Buy {pkg.credits}
              </Button>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-ink-400">
          Demo checkout — in production this opens a secure Stripe checkout. No card is charged here.
        </p>
      </section>

      {/* Reassurance */}
      <div className="mt-8 rounded-xl border border-line bg-ivory-50 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <Stat label="Successful bookings" value={sorted.filter((t) => t.type === "booking_success").length} hydrated={hydrated} />
          <Stat label="Failed attempts (0 credits)" value={failedFreeAttempts} hydrated={hydrated} />
        </div>
      </div>

      {/* History */}
      <section className="mt-10">
        <h3 className="font-serif text-2xl text-ink-900">Transaction history</h3>
        <div className="card-surface mt-4 divide-y divide-line">
          {sorted.map((t) => (
            <TransactionRow key={t.id} t={t} />
          ))}
          {sorted.length === 0 && <p className="px-5 py-6 text-sm text-ink-400">No transactions yet.</p>}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, hydrated }: { label: string; value: number; hydrated: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <CheckIcon className="h-4 w-4 text-sage-600" />
      <p className="text-sm text-ink-600">
        <span className="font-medium text-ink-900">{hydrated ? value : "—"}</span> {label}
      </p>
    </div>
  );
}

function TransactionRow({ t }: { t: CreditTransaction }) {
  const positive = t.amount > 0;
  const free = t.amount === 0;
  return (
    <div className="flex items-center justify-between px-5 py-3.5">
      <div>
        <p className="text-sm font-medium text-ink-800">{TYPE_LABEL[t.type]}</p>
        <p className="text-[12px] text-ink-400">{t.reason} · {formatDateTime(t.created_at)}</p>
      </div>
      <span
        className={cn(
          "text-sm font-medium tabular-nums",
          positive ? "text-sage-600" : free ? "text-ink-400" : "text-ink-700",
        )}
      >
        {free ? "Free" : positive ? `+${t.amount}` : t.amount}
      </span>
    </div>
  );
}
