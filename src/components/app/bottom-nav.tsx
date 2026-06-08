"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { isActivePath } from "@/lib/nav";
import { NAV_ITEMS } from "./nav-config";

/**
 * Mobile bottom navigation. Concierge is reached via its floating action
 * button (see ConciergePanel), so it isn't duplicated here.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t border-line bg-ivory-100/95 backdrop-blur lg:hidden">
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = isActivePath(pathname, href);
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
            <span className="w-full truncate text-center leading-none">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
