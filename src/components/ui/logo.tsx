import { cn } from "@/lib/cn";

/** Wordmark — elegant serif, with a small sage table-dot mark. */
export function Logo({ className, mark = true }: { className?: string; mark?: boolean }) {
  return (
    <span className={cn("inline-flex items-baseline gap-2 font-serif", className)}>
      {mark && (
        <span className="relative inline-flex h-2.5 w-2.5 translate-y-[-1px] items-center justify-center">
          <span className="h-2.5 w-2.5 rounded-full bg-sage-500" />
        </span>
      )}
      <span className="text-xl font-semibold tracking-tight text-ink-900">
        Table<span className="text-sage-600">Now</span>
      </span>
    </span>
  );
}
