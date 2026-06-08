"use client";

import { useMemo, useState } from "react";
import { CalendarIcon } from "@/components/icons";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/components/hydrated";
import { cn } from "@/lib/cn";
import { parseDate } from "@/lib/format";
import { REQUEST_STATUS_META, type StatusTone } from "@/lib/status";
import { useStore } from "@/lib/store";
import { useUi } from "@/lib/ui-store";
import type { ReservationRequest } from "@/lib/types";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const TONE_BAR: Record<StatusTone, string> = {
  success: "bg-sage-500 text-ivory-50",
  active: "border border-sage-300 bg-sage-50 text-sage-700",
  warning: "border border-clay-200 bg-clay-100 text-clay-600",
  muted: "bg-ivory-200 text-ink-400",
  neutral: "border border-line bg-ivory-100 text-ink-500",
};

const SHOWN_STATUSES = new Set(["active", "booked", "expired", "paused", "needs_connection", "needs_credits"]);

function isoDay(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function CalendarPage() {
  const hydrated = useHydrated();
  const requests = useStore((s) => s.requests);
  const openDrawer = useUi((s) => s.openDrawer);
  const [cursor, setCursor] = useState(() => new Date());

  const relevant = useMemo(
    () => requests.filter((r) => SHOWN_STATUSES.has(r.status)),
    [requests],
  );

  // Map each day -> requests touching it (single date or any day in range).
  const byDay = useMemo(() => {
    const map = new Map<string, ReservationRequest[]>();
    for (const r of relevant) {
      const start = parseDate(r.date_start);
      const end = parseDate(r.date_end);
      const d = new Date(start);
      while (d <= end) {
        const key = isoDay(d);
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(r);
        d.setDate(d.getDate() + 1);
      }
    }
    return map;
  }, [relevant]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = isoDay(new Date());

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="mx-auto max-w-4xl px-5 py-7 sm:px-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="eyebrow mb-2">Calendar</p>
          <h2 className="font-serif text-3xl text-ink-900">
            {MONTHS[month]} {year}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setCursor(new Date(year, month - 1, 1))} aria-label="Previous month">‹</Button>
          <Button variant="ghost" size="sm" onClick={() => setCursor(new Date())}>Today</Button>
          <Button variant="secondary" size="sm" onClick={() => setCursor(new Date(year, month + 1, 1))} aria-label="Next month">›</Button>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-ink-500">
        <Legend tone="success" label="Booked" />
        <Legend tone="active" label="Active" />
        <Legend tone="warning" label="Needs action" />
        <Legend tone="muted" label="Expired / paused" />
      </div>

      {hydrated && relevant.length === 0 ? (
        <EmptyState
          icon={<CalendarIcon className="h-6 w-6" />}
          title="Your active requests and booked tables will show up here."
          body="Create a request and you'll see it land on the calendar."
        />
      ) : (
        <div className="card-surface overflow-hidden p-0">
          <div className="grid grid-cols-7 border-b border-line bg-ivory-100">
            {DOW.map((d) => (
              <div key={d} className="px-2 py-2.5 text-center text-[11px] font-medium uppercase tracking-wide text-ink-400">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((date, i) => {
              const key = date ? isoDay(date) : `empty-${i}`;
              const items = date ? byDay.get(isoDay(date)) ?? [] : [];
              const isToday = date && isoDay(date) === todayKey;
              return (
                <div
                  key={key}
                  className={cn(
                    "min-h-[92px] border-b border-r border-line p-1.5 last:border-r-0 [&:nth-child(7n)]:border-r-0",
                    !date && "bg-ivory-100/40",
                  )}
                >
                  {date && (
                    <>
                      <div className={cn("mb-1 flex h-6 w-6 items-center justify-center rounded-full text-[12px]", isToday ? "bg-sage-500 font-medium text-ivory-50" : "text-ink-500")}>
                        {date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {items.slice(0, 3).map((r) => (
                          <button
                            key={r.id + key}
                            onClick={() => openDrawer(r.id)}
                            className={cn(
                              "block w-full truncate rounded-md px-1.5 py-0.5 text-left text-[11px] leading-tight transition hover:opacity-80",
                              TONE_BAR[REQUEST_STATUS_META[r.status].tone],
                            )}
                          >
                            {r.restaurant_name}
                          </button>
                        ))}
                        {items.length > 3 && <p className="px-1 text-[10px] text-ink-400">+{items.length - 3} more</p>}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Legend({ tone, label }: { tone: StatusTone; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("inline-block h-3 w-5 rounded", TONE_BAR[tone])} />
      {label}
    </span>
  );
}
