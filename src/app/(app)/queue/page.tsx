"use client";

import { useMemo, useState } from "react";
import { PlusIcon, QueueIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  QueueFilters,
  type QueueFilterState,
} from "@/components/queue/queue-filters";
import { ReservationCard } from "@/components/queue/reservation-card";
import { useHydrated } from "@/components/hydrated";
import { useStore } from "@/lib/store";
import { useUi } from "@/lib/ui-store";
import type { RequestStatus } from "@/lib/types";

const HIDDEN_BY_DEFAULT: RequestStatus[] = ["canceled"];

export default function QueuePage() {
  const hydrated = useHydrated();
  const requests = useStore((s) => s.requests);
  const openAddModal = useUi((s) => s.openAddModal);

  const [filters, setFilters] = useState<QueueFilterState>({
    search: "",
    platform: "all",
    status: "all",
    party: "all",
    sort: "recent",
  });

  const visible = useMemo(
    () => requests.filter((r) => !HIDDEN_BY_DEFAULT.includes(r.status)),
    [requests],
  );

  const counts = useMemo(() => {
    const c: Partial<Record<RequestStatus | "all", number>> = { all: visible.length };
    for (const r of visible) c[r.status] = (c[r.status] ?? 0) + 1;
    return c;
  }, [visible]);

  const filtered = useMemo(() => {
    let list = visible.filter((r) => {
      if (filters.search && !r.restaurant_name.toLowerCase().includes(filters.search.toLowerCase()))
        return false;
      if (filters.platform !== "all" && r.platform !== filters.platform) return false;
      if (filters.status !== "all" && r.status !== filters.status) return false;
      if (filters.party !== "all" && r.party_size !== filters.party) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (filters.sort === "name") return a.restaurant_name.localeCompare(b.restaurant_name);
      if (filters.sort === "next_check") {
        return (a.next_check_at ?? "9").localeCompare(b.next_check_at ?? "9");
      }
      return b.created_at.localeCompare(a.created_at);
    });
    return list;
  }, [visible, filters]);

  const activeCount = counts.active ?? 0;

  return (
    <div className="mx-auto max-w-3xl px-5 py-7 sm:px-8">
      <div className="mb-6 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow mb-2">Your watches</p>
          <h2 className="font-serif text-2xl text-ink-900 sm:text-3xl">
            {hydrated && activeCount > 0
              ? `${activeCount} table${activeCount === 1 ? "" : "s"} on the watch`
              : "Your watches"}
          </h2>
        </div>
        <Button onClick={() => openAddModal()} size="sm" className="flex-none sm:h-11 sm:px-5 sm:text-sm">
          <PlusIcon className="h-4 w-4 sm:hidden" />
          <span className="hidden sm:inline">New request</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      <QueueFilters state={filters} onChange={(p) => setFilters((f) => ({ ...f, ...p }))} counts={counts} />

      <div className="mt-6 space-y-4">
        {!hydrated ? (
          <SkeletonList />
        ) : filtered.length === 0 && visible.length === 0 ? (
          <EmptyState
            icon={<QueueIcon className="h-6 w-6" />}
            title="Start with the table you want most."
            body="Set a watch and we'll alert you the moment a matching table opens — then you book it in one tap."
            action={<Button onClick={() => openAddModal()}>Create your first watch</Button>}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No requests match these filters."
            body="Try clearing a filter to see your full queue."
          />
        ) : (
          filtered.map((r) => <ReservationCard key={r.id} request={r} />)
        )}
      </div>
    </div>
  );
}

function SkeletonList() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <div key={i} className="card-surface h-44 animate-pulse-soft" />
      ))}
    </>
  );
}
