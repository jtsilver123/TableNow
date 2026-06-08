"use client";

import Link from "next/link";
import { CreditIcon } from "@/components/icons";
import { useHydrated } from "@/components/hydrated";
import { useStore } from "@/lib/store";

/** Always-visible credit balance for the top nav. */
export function CreditBadge() {
  const hydrated = useHydrated();
  const balance = useStore((s) => s.user.credit_balance);
  const freeUsed = useStore((s) => s.user.free_credit_used);

  const showFree = hydrated && !freeUsed;

  return (
    <Link
      href="/credits"
      className="group inline-flex items-center gap-2 rounded-full border border-line bg-ivory-50 py-1.5 pl-2.5 pr-3.5 text-sm transition hover:border-sage-300 hover:bg-sage-50 focus-ring"
      title="1 credit is used only when we successfully book your table."
    >
      <CreditIcon className="h-4 w-4 text-sage-600" />
      <span className="font-medium text-ink-800">
        {hydrated ? balance : "—"}
        <span className="ml-1 font-normal text-ink-400">
          {balance === 1 ? "credit" : "credits"}
        </span>
      </span>
      {showFree && (
        <span className="hidden rounded-full bg-sage-100 px-2 py-0.5 text-[10px] font-medium text-sage-700 sm:inline">
          + free booking
        </span>
      )}
    </Link>
  );
}
