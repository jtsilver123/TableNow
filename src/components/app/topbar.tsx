"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { PlanBadge } from "./plan-badge";
import { useHydrated } from "@/components/hydrated";
import { useStore } from "@/lib/store";

export function Topbar({ title }: { title: string }) {
  const hydrated = useHydrated();
  const name = useStore((s) => s.user.name);
  const initials = hydrated
    ? name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
    : "";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-ivory-100/85 px-5 backdrop-blur sm:px-8">
      <div className="flex items-center gap-3">
        <Link href="/queue" className="lg:hidden">
          <Logo mark />
        </Link>
        <h1 className="hidden font-serif text-2xl text-ink-900 lg:block">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <PlanBadge />
        <Link
          href="/settings"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-100 text-[12px] font-semibold text-sage-700 ring-1 ring-sage-200 transition hover:bg-sage-200 focus-ring"
          aria-label="Settings"
        >
          {initials || "·"}
        </Link>
      </div>
    </header>
  );
}
