"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useHydrated } from "@/components/hydrated";
import { Sidebar } from "@/components/app/sidebar";
import { Topbar } from "@/components/app/topbar";
import { BottomNav } from "@/components/app/bottom-nav";
import { ConciergePanel } from "@/components/concierge/concierge-panel";
import { AddRequestModal } from "@/components/queue/add-request-modal";
import { RequestDrawer } from "@/components/queue/request-drawer";
import { SimulationRunner } from "@/components/app/simulation-runner";
import { useStore } from "@/lib/store";
import { getSupabase } from "@/lib/supabase/client";

const TITLES: Record<string, string> = {
  "/queue": "Watches",
  "/calendar": "Calendar",
  "/plan": "Plan",
  "/settings": "Settings",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const authed = useStore((s) => s.authed);
  const login = useStore((s) => s.login);
  const router = useRouter();
  const pathname = usePathname();
  const title = TITLES[pathname] ?? "TableNow";

  useEffect(() => {
    if (!hydrated || authed) return;
    const supabase = getSupabase();
    if (!supabase) {
      router.replace("/login");
      return;
    }

    let canceled = false;
    void supabase.auth.getSession().then(({ data }) => {
      if (canceled) return;
      if (data.session) login();
      else router.replace("/login");
    });
    return () => {
      canceled = true;
    };
  }, [hydrated, authed, login, router]);

  if (!hydrated || !authed) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-sage-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} />
        <div className="flex min-h-0 flex-1">
          <main className="min-w-0 flex-1 pb-24 lg:pb-0">{children}</main>
          {/* Concierge — right panel on desktop, drawer on mobile */}
          <ConciergePanel />
        </div>
      </div>

      <BottomNav />

      {/* Global overlays */}
      <AddRequestModal />
      <RequestDrawer />

      {/* Booking engine simulation (stands in for Cloudflare Cron + Queues) */}
      <SimulationRunner />
    </div>
  );
}
