import { cn } from "@/lib/cn";
import { REQUEST_STATUS_META, TONE_DOT, TONE_PILL } from "@/lib/status";
import type { RequestStatus } from "@/lib/types";

/** Status pill with a tone-coloured dot. Used on cards, drawer, calendar. */
export function StatusPill({
  status,
  className,
  showDot = true,
}: {
  status: RequestStatus;
  className?: string;
  showDot?: boolean;
}) {
  const meta = REQUEST_STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
        TONE_PILL[meta.tone],
        className,
      )}
    >
      {showDot && <span className={cn("h-1.5 w-1.5 rounded-full", TONE_DOT[meta.tone])} />}
      {meta.label}
    </span>
  );
}

/** Neutral label chip, e.g. platform or seating. */
export function Tag({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-line bg-ivory-100 px-2.5 py-1 text-[11px] font-medium text-ink-600",
        className,
      )}
    >
      {children}
    </span>
  );
}
