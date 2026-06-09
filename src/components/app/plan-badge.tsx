"use client";

import Link from "next/link";
import { useHydrated } from "@/components/hydrated";
import { SparkIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import { FREE_WATCH_LIMIT } from "@/lib/types";
import { useStore } from "@/lib/store";

/** Plan status + watch usage for the top nav. */
export function PlanBadge() {
  const hydrated = useHydrated();
  const plan = useStore((s) => s.user.plan);
  const activeCount = useStore((s) => s.requests.filter((r) => r.status === "active").length);

  if (!hydrated) {
    return <span className="h-8 w-24 rounded-full bg-ivory-200" />;
  }

  if (plan === "premium") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-sage-200 bg-sage-50 py-1.5 pl-2.5 pr-3.5 text-sm font-medium text-sage-700">
        <SparkIcon className="h-4 w-4" />
        Premium
      </span>
    );
  }

  const atLimit = activeCount >= FREE_WATCH_LIMIT;
  return (
    <Link
      href="/plan"
      className={cn(
        "group inline-flex items-center gap-2 rounded-full border py-1.5 pl-3.5 pr-2 text-sm transition focus-ring",
        atLimit
          ? "border-clay-200 bg-clay-100 hover:bg-clay-200/60"
          : "border-line bg-ivory-50 hover:border-sage-300 hover:bg-sage-50",
      )}
      title={`Free plan — ${activeCount}/${FREE_WATCH_LIMIT} active watches`}
    >
      <span className="hidden text-ink-500 sm:inline">
        {activeCount}/{FREE_WATCH_LIMIT} watches
      </span>
      <span className="rounded-full bg-sage-500 px-2.5 py-1 text-[12px] font-medium text-ivory-50 group-hover:bg-sage-600">
        Upgrade
      </span>
    </Link>
  );
}
