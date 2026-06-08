"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CloseButton, Drawer } from "@/components/ui/overlay";
import { Leader } from "@/components/ui/leader";
import { StatusPill } from "@/components/ui/pill";
import { CheckIcon } from "@/components/icons";
import {
  ATTEMPT_STATUS_LABEL,
  FLEXIBILITY_LABEL,
  PLATFORM_LABEL,
  REQUEST_STATUS_META,
  SEATING_LABEL,
} from "@/lib/status";
import {
  formatDateRange,
  formatDateTime,
  formatPartySize,
  formatRelative,
  formatTimeWindow,
} from "@/lib/format";
import { cn } from "@/lib/cn";
import { CREDIT_COPY } from "@/lib/credits";
import { useStore } from "@/lib/store";
import { useUi } from "@/lib/ui-store";
import type { AttemptStatus, ReservationRequest } from "@/lib/types";

const SUCCESS_STATES: AttemptStatus[] = ["match_found", "booking_succeeded"];

export function RequestDrawer() {
  const id = useUi((s) => s.drawerRequestId);
  const close = useUi((s) => s.closeDrawer);
  const openEditModal = useUi((s) => s.openEditModal);
  const router = useRouter();

  const request = useStore((s) => s.requests.find((r) => r.id === id));
  const attempts = useStore((s) => s.attempts);
  const bookings = useStore((s) => s.bookings);
  const connections = useStore((s) => s.connections);

  const pauseRequest = useStore((s) => s.pauseRequest);
  const resumeRequest = useStore((s) => s.resumeRequest);
  const cancelRequest = useStore((s) => s.cancelRequest);
  const duplicateRequest = useStore((s) => s.duplicateRequest);

  const timeline = useMemo(
    () =>
      attempts
        .filter((a) => a.reservation_request_id === id)
        .sort((a, b) => b.checked_at.localeCompare(a.checked_at)),
    [attempts, id],
  );
  const booking = bookings.find((b) => b.reservation_request_id === id);
  const connection = connections.find((c) => c.provider === request?.platform);

  const suggestions = request ? buildSuggestions(request) : [];

  return (
    <Drawer open={Boolean(request)} onClose={close}>
      {request && (
        <>
          <header className="flex items-start justify-between gap-3 border-b border-line px-6 pb-5 pt-6">
            <div className="min-w-0">
              <p className="eyebrow mb-1.5">{PLATFORM_LABEL[request.platform]} · {request.city}</p>
              <h2 className="truncate font-serif text-3xl text-ink-900">{request.restaurant_name}</h2>
              <div className="mt-3">
                <StatusPill status={request.status} />
              </div>
            </div>
            <CloseButton onClick={close} />
          </header>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {/* Credit rule */}
            <div className="rounded-xl border border-line bg-ivory-100 px-4 py-3 text-[13px] text-ink-600">
              <span className="font-medium text-ink-800">Credit rule · </span>
              {CREDIT_COPY}
            </div>

            {/* Booking result */}
            {booking && (
              <div className="mt-5 rounded-xl border border-sage-200 bg-sage-50 p-4">
                <div className="flex items-center gap-2">
                  <CheckIcon className="h-5 w-5 text-sage-600" />
                  <p className="font-medium text-ink-900">Table booked</p>
                </div>
                <div className="mt-3">
                  <Leader label="Confirmation" value={booking.confirmation_number} emphasis />
                  <Leader label="Credit used" value={booking.credit_used ? "1 credit" : "Free booking"} />
                  <Leader label="Booked" value={formatDateTime(booking.booked_at)} />
                </div>
              </div>
            )}

            {/* Criteria */}
            <section className="mt-6">
              <p className="eyebrow mb-2">Request</p>
              <div className="card-surface px-4 py-2">
                <Leader label="Party size" value={formatPartySize(request.party_size)} />
                <Leader label="Date" value={formatDateRange(request)} />
                <Leader label="Time window" value={formatTimeWindow(request)} />
                <Leader label="Flexibility" value={FLEXIBILITY_LABEL[request.flexibility_level]} />
                <Leader label="Seating" value={SEATING_LABEL[request.seating_preference]} />
                {request.priority === "high" && <Leader label="Priority" value="High" emphasis />}
              </div>
              {request.notes && (
                <p className="mt-3 rounded-xl bg-ivory-200/60 px-4 py-3 text-[13px] italic text-ink-600">
                  &ldquo;{request.notes}&rdquo;
                </p>
              )}
            </section>

            {/* Connection + checks */}
            <section className="mt-6">
              <p className="eyebrow mb-2">Monitoring</p>
              <div className="card-surface px-4 py-2">
                <Leader
                  label={`${PLATFORM_LABEL[request.platform]} connection`}
                  value={
                    connection?.status === "connected" ? (
                      <span className="text-sage-600">Connected</span>
                    ) : (
                      <span className="text-clay-600">Not connected</span>
                    )
                  }
                />
                <Leader label="Last checked" value={formatRelative(request.last_checked_at)} />
                <Leader label="Next check" value={request.next_check_at ? formatRelative(request.next_check_at) : "—"} />
              </div>
            </section>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <section className="mt-6">
                <p className="eyebrow mb-2">Suggested improvements</p>
                <ul className="space-y-2">
                  {suggestions.map((sug) => (
                    <li key={sug} className="flex gap-2 rounded-xl border border-line bg-ivory-50 px-3.5 py-2.5 text-[13px] text-ink-600">
                      <span className="mt-1.5 h-1 w-1 flex-none rounded-full bg-sage-400" />
                      {sug}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Attempt timeline */}
            <section className="mt-6">
              <p className="eyebrow mb-3">Attempt timeline</p>
              {timeline.length === 0 ? (
                <p className="text-[13px] text-ink-400">No checks yet. We&apos;ll start as soon as it&apos;s active.</p>
              ) : (
                <ol className="relative ml-1.5 border-l border-line pl-5">
                  {timeline.map((a) => {
                    const good = SUCCESS_STATES.includes(a.status);
                    return (
                      <li key={a.id} className="relative pb-5 last:pb-0">
                        <span
                          className={cn(
                            "absolute -left-[26px] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-ivory-50",
                            good ? "bg-sage-500" : a.status === "booking_failed" || a.status === "connection_failed" ? "bg-clay-400" : "bg-ink-300",
                          )}
                        />
                        <p className={cn("text-[13px]", good ? "font-medium text-ink-900" : "text-ink-700")}>
                          {a.message || ATTEMPT_STATUS_LABEL[a.status]}
                        </p>
                        <p className="mt-0.5 text-[11px] text-ink-400">{formatDateTime(a.checked_at)}</p>
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>
          </div>

          {/* Actions */}
          <footer className="border-t border-line bg-ivory-50/95 px-6 py-4 backdrop-blur">
            <DrawerActions
              request={request}
              onEdit={() => openEditModal(request.id, request)}
              onPause={() => pauseRequest(request.id)}
              onResume={() => resumeRequest(request.id)}
              onCancel={() => {
                cancelRequest(request.id);
                close();
              }}
              onDuplicate={() => duplicateRequest(request.id)}
              onAddCredits={() => {
                close();
                router.push("/credits");
              }}
              onConnect={() => {
                close();
                router.push("/connections");
              }}
            />
          </footer>
        </>
      )}
    </Drawer>
  );
}

function DrawerActions({
  request,
  onEdit,
  onPause,
  onResume,
  onCancel,
  onDuplicate,
  onAddCredits,
  onConnect,
}: {
  request: ReservationRequest;
  onEdit: () => void;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  onDuplicate: () => void;
  onAddCredits: () => void;
  onConnect: () => void;
}) {
  const s = request.status;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {s === "needs_credits" && <Button onClick={onAddCredits}>Add credits</Button>}
      {s === "needs_connection" && <Button onClick={onConnect}>Connect account</Button>}
      {s === "active" && (
        <Button variant="secondary" onClick={onPause}>
          Pause
        </Button>
      )}
      {(s === "paused" || s === "draft") && <Button onClick={onResume}>{s === "draft" ? "Activate" : "Resume"}</Button>}
      {s !== "booked" && s !== "canceled" && (
        <Button variant="ghost" onClick={onEdit}>
          Edit
        </Button>
      )}
      <Button variant="ghost" onClick={onDuplicate}>
        Duplicate
      </Button>
      <div className="ml-auto">
        {s !== "canceled" && s !== "booked" && (
          <Button variant="ghost" onClick={onCancel} className="text-clay-600 hover:bg-clay-100">
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

function buildSuggestions(request: ReservationRequest): string[] {
  const out: string[] = [];
  if (request.status === "booked" || request.status === "canceled") return out;
  if (request.flexibility_level === "strict") {
    out.push("Loosen flexibility to “Flexible” to widen the times we can grab.");
  }
  if (request.date_start === request.date_end) {
    out.push("Add a date range — even one extra night meaningfully improves your odds.");
  }
  const start = Number(request.time_start.split(":")[0]);
  const end = Number(request.time_end.split(":")[0]);
  if (end - start < 2) {
    out.push("Widen your time window to give us more openings to catch.");
  }
  if (request.seating_preference !== "any") {
    out.push("Allow any seating to include bar and counter tables.");
  }
  return out;
}
