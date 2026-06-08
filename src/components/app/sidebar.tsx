"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import { isActivePath } from "@/lib/nav";
import { useUi } from "@/lib/ui-store";
import { NAV_ITEMS } from "./nav-config";

export function Sidebar() {
  const pathname = usePathname();
  const openAddModal = useUi((s) => s.openAddModal);

  return (
    <aside className="sticky top-0 hidden h-screen w-60 flex-none flex-col border-r border-line bg-ivory-50/60 px-4 py-6 lg:flex">
      <Link href="/queue" className="px-2">
        <Logo />
      </Link>

      <Button onClick={() => openAddModal()} size="sm" className="mt-7 w-full">
        <PlusIcon className="h-4 w-4" />
        New request
      </Button>

      <nav className="mt-7 flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = isActivePath(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition focus-ring",
                active
                  ? "bg-ivory-50 font-medium text-ink-900 shadow-card ring-1 ring-line"
                  : "text-ink-500 hover:bg-ivory-200/60 hover:text-ink-800",
              )}
            >
              <Icon className={cn("h-[18px] w-[18px]", active && "text-sage-600")} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-xl border border-line bg-ivory-50 p-4">
        <p className="text-[13px] font-medium text-ink-800">First booking free</p>
        <p className="mt-1 text-[12px] leading-relaxed text-ink-500">
          A credit is only used when we successfully book your table.
        </p>
      </div>
    </aside>
  );
}
