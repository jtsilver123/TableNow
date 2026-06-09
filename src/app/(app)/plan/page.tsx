"use client";

import { Button } from "@/components/ui/button";
import { CheckIcon, SparkIcon } from "@/components/icons";
import { useHydrated } from "@/components/hydrated";
import { cn } from "@/lib/cn";
import { FREE_WATCH_LIMIT, PLANS } from "@/lib/types";
import { useStore } from "@/lib/store";

export default function PlanPage() {
  const hydrated = useHydrated();
  const user = useStore((s) => s.user);
  const activeCount = useStore((s) => s.requests.filter((r) => r.status === "active").length);
  const setPlan = useStore((s) => s.setPlan);

  const current = hydrated ? user.plan : "free";

  return (
    <div className="mx-auto max-w-3xl px-5 py-7 sm:px-8">
      <p className="eyebrow mb-2">Plan</p>
      <h2 className="font-serif text-3xl text-ink-900">Watch more tables.</h2>
      <p className="mt-2 max-w-lg text-sm text-ink-500">
        Free covers {FREE_WATCH_LIMIT} active watches. Premium unlocks unlimited watches, faster
        checks, and the widest flexibility.
      </p>

      {hydrated && current === "free" && (
        <div className="mt-5 rounded-xl border border-line bg-ivory-50 px-5 py-3 text-[13px] text-ink-600">
          You&apos;re on <span className="font-medium text-ink-900">Free</span> ·{" "}
          {activeCount}/{FREE_WATCH_LIMIT} active watches used.
        </div>
      )}

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        {PLANS.map((tier) => {
          const isCurrent = current === tier.id;
          const premium = tier.id === "premium";
          return (
            <div
              key={tier.id}
              className={cn("card-surface relative flex flex-col p-6", premium && "ring-2 ring-sage-300")}
            >
              {premium && (
                <span className="absolute -top-2.5 left-6 inline-flex items-center gap-1 rounded-full bg-sage-500 px-2.5 py-0.5 text-[10px] font-medium text-ivory-50">
                  <SparkIcon className="h-3 w-3" /> Most popular
                </span>
              )}
              <p className="eyebrow">{tier.name}</p>
              <p className="mt-2 font-serif text-4xl text-ink-900">
                ${tier.price}
                {premium && <span className="text-lg text-ink-400">/mo</span>}
              </p>
              <p className="mt-1 text-[13px] text-ink-500">{tier.tagline}</p>
              <hr className="rule my-5" />
              <ul className="space-y-2.5">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-ink-600">
                    <CheckIcon className="mt-0.5 h-4 w-4 flex-none text-sage-600" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                {isCurrent ? (
                  <Button variant="secondary" className="w-full" disabled>
                    Current plan
                  </Button>
                ) : premium ? (
                  <Button className="w-full" onClick={() => setPlan("premium")}>
                    Upgrade to Premium
                  </Button>
                ) : (
                  <Button variant="ghost" className="w-full" onClick={() => setPlan("free")}>
                    Switch to Free
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-[11px] text-ink-400">
        Demo billing — in production, Upgrade opens a secure Stripe checkout. No card is charged here.
      </p>
    </div>
  );
}
