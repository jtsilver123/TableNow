"use client";

import { useRouter } from "next/navigation";
import { StatusPill } from "@/components/ui/pill";
import { Button } from "@/components/ui/button";
import { PauseIcon } from "@/components/icons";
import {
  FLEXIBILITY_LABEL,
  PLATFORM_LABEL,
  REQUEST_STATUS_META,
} from "@/lib/status";
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

  const meta = REQUEST_STATUS_META[request.status];
  const searching = request.status === "active";

  function act(e: React.MouseEvent) {
    e.stopPropagation();
    switch (request.status) {
      case "needs_credits":
        router.push("/credits");
        break;
      case "needs_connection":
        router.push("/connections");
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
    needs_credits: "Add credits",
    needs_connection: "Connect account",
    active: "Pause",
    paused: "Resume",
    draft: "Activate",
    booked: "View booking",
    expired: "View details",
    failed: "View details",
    canceled: "View details",
  };

  return (
    <article
      onClick={() => openDrawer(request.id)}
      className="card-surface group cursor-pointer p-5 transition hover:-translate-y-0.5 hover:shadow-float"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-serif text-xl text-ink-900">{request.restaurant_name}</h3>
          </div>
          <p className="mt-0.5 truncate text-[13px] text-ink-400">
            {request.neighborhood ? `${request.neighborhood} · ` : ""}
            {request.city} · {PLATFORM_LABEL[request.platform]}
          </p>
        </div>
        <StatusPill status={request.status} />
      </div>

      <hr className="rule my-4" />

      {/* Core spec rows, leader-line style but compact */}
      <div className="grid grid-cols-2 gap-x-5 gap-y-2 text-[13px]">
        <Detail label="Party" value={formatPartySize(request.party_size)} />
        <Detail label="When" value={formatDateRange(request)} />
        <Detail label="Time" value={formatTimeWindow(request)} />
        <Detail label="Flexibility" value={FLEXIBILITY_LABEL[request.flexibility_level]} />
      </div>

      <hr className="rule my-4" />

      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[12px] text-ink-500">
            {searching && <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-sage-500" />}
            {meta.micro}
          </p>
          <p className="mt-0.5 truncate text-[11px] text-ink-400">
            {request.status === "booked"
              ? "No credit used unless booked"
              : searching
                ? `Last checked ${formatRelative(request.last_checked_at)} · next ${formatRelative(request.next_check_at)}`
                : "No credit used unless booked"}
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
