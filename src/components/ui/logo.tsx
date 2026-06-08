import { cn } from "@/lib/cn";

/**
 * TableNow logo mark — a minimalist place setting: a plate (ring) with a fork
 * and knife, set on a sage tile. Editorial, hospitality-forward, and legible
 * down to favicon size.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} role="img" aria-label="TableNow">
      <rect width="32" height="32" rx="9" fill="#6B8459" />
      {/* plate */}
      <circle cx="16" cy="16.5" r="6.4" fill="none" stroke="#F7F4ED" strokeWidth="1.5" />
      <circle cx="16" cy="16.5" r="1.5" fill="#F7F4ED" />
      {/* fork */}
      <path
        d="M9.2 8.5v4.2M10.7 8.5v4.2M9.95 12.7v10.8"
        stroke="#F7F4ED"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      {/* knife */}
      <path
        d="M22.3 8.5c1.2 0 1.2 5.4 0 6.2-1 .7-1 .2-1 .2v8.6"
        stroke="#F7F4ED"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/** Wordmark — the mark plus the "TableNow" serif lockup. */
export function Logo({ className, mark = true }: { className?: string; mark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-serif", className)}>
      {mark && <LogoMark className="h-7 w-7 flex-none" />}
      <span className="text-xl font-semibold tracking-tight text-ink-900">
        Table<span className="text-sage-600">Now</span>
      </span>
    </span>
  );
}
