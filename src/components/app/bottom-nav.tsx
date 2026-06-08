"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConciergeIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import { useUi } from "@/lib/ui-store";
import { NAV_ITEMS } from "./nav-config";

/** Mobile bottom navigation. Concierge is surfaced as a tab. */
export function BottomNav() {
  const pathname = usePathname();
  const setConcierge = useUi((s) => s.setConciergeMobile);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t border-line bg-ivory-100/95 backdrop-blur lg:hidden">
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition",
              active ? "text-sage-600" : "text-ink-400",
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
      <button
        onClick={() => setConcierge(true)}
        className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium text-ink-400 transition"
      >
        <ConciergeIcon className="h-5 w-5" />
        Concierge
      </button>
    </nav>
  );
}
