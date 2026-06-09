"use client";

import { useRouter } from "next/navigation";
import { StatusPill } from "@/components/ui/pill";
import { Button } from "@/components/ui/button";
import { PlatformLogo } from "@/components/ui/platform-logo";
import { PauseIcon } from "@/components/icons";
import { FLEXIBILITY_LABEL, PLATFORM_LABEL, REQUEST_STATUS_META } from "@/lib/status";
import {
  formatDateRange,
  formatPartySize,
  formatRelative,
  formatTimeWindow,
} from "@/lib/format";
import { useStore } from "@/lib/store";
import { useUi } from "@/lib/ui-store";
import type { ReservationRequest } from "@/lib/types";

export function ReservationCard({ request }: { request: ReservationRequest }) {
  const router = useRouter();
  const openDrawer = useUi((s) => s.openDrawer);
  const pauseRequest = useStore((s) => s.pauseRequest);
  const resumeRequest = useStore((s) => s.resumeRequest);
  const activateRequest = useStore((s) => s.activateRequest);
  const pushToast = useStore((s) => s.pushToast);
  const found = useStore((s) =>
    request.status === "booked"
      ? s.bookings.find((b) => b.reservation_request_id === request.id)
      : undefined,
  );

  const meta = REQUEST_STATUS_META[request.status];
  const watching = request.status === "active";

  function act(e: React.MouseEvent) {
    e.stopPropagation();
    switch (request.status) {
      case "needs_credits":
        router.push("/plan");
        break;
      case "active":
        pauseRequest(request.id);
        break;
      case "paused":
        resumeRequest(request.id);
        break;
      case "draft": {
        const res = activateRequest(request.id);
        pushToast(res.activated ? "success" : "warning", res.message);
        break;
      }
      default:
        openDrawer(request.id);
    }
  }

  const actionLabel: Record<string, string> = {
    needs_credits: "Upgrade",
    active: "Pause",
    paused: "Resume",
    draft: "Start watching",
    booked: "Details",
    expired: "View details",
    canceled: "View details",
  };

  return (
    <article
      onClick={() => openDrawer(request.id)}
      className="card-surface group cursor-pointer p-5 transition hover:-translate-y-0.5 hover:shadow-float"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-serif text-xl text-ink-900">{request.restaurant_name}</h3>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-[13px] text-ink-400">
            <span className="truncate">
              {request.neighborhood ? `${request.neighborhood} · ` : ""}
              {request.city}
            </span>
            <span aria-hidden>·</span>
            <PlatformLogo platform={request.platform} className="text-[13px]" />
          </p>
        </div>
        <StatusPill status={request.status} />
      </div>

      <hr className="rule my-4" />

      <div className="grid grid-cols-2 gap-x-5 gap-y-2 text-[13px]">
        <Detail label="Party" value={formatPartySize(request.party_size)} />
        <Detail label="When" value={formatDateRange(request)} />
        <Detail label="Time" value={formatTimeWindow(request)} />
        <Detail label="Flexibility" value={FLEXIBILITY_LABEL[request.flexibility_level]} />
      </div>

      <hr className="rule my-4" />

      {/* Found table → one-tap book link */}
      {request.status === "booked" && found ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-[12px] text-sage-700">Table found — book it before it&apos;s gone.</p>
          <a
            href={found.book_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex flex-none items-center gap-1.5 rounded-lg bg-sage-500 px-3.5 py-2 text-[13px] font-medium text-ivory-50 transition hover:bg-sage-600 focus-ring"
          >
            Book on {PLATFORM_LABEL[request.platform]}
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
              <path d="M6 3h7v7M13 3 4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[12px] text-ink-500">
              {watching && <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-sage-500" />}
              {meta.micro}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-ink-400">
              {watching
                ? `Last checked ${formatRelative(request.last_checked_at)} · next ${formatRelative(request.next_check_at)}`
                : "We'll alert you the moment a table opens"}
            </p>
          </div>
          <Button
            variant={request.status === "active" ? "secondary" : "primary"}
            size="sm"
            onClick={act}
            className="flex-none"
          >
            {request.status === "active" && <PauseIcon className="h-3.5 w-3.5" />}
            {actionLabel[request.status] ?? "View"}
          </Button>
        </div>
      )}
    </article>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-ink-400">{label}</p>
      <p className="text-ink-800">{value}</p>
    </div>
  );
}
