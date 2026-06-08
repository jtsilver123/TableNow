import { cn } from "@/lib/cn";

/**
 * Dotted leader-line row — the signature restaurant-menu detail.
 * Label on the left, value on the right, joined by a dotted rule.
 */
export function Leader({
  label,
  value,
  className,
  emphasis,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  className?: string;
  emphasis?: boolean;
}) {
  return (
    <div className={cn("leader py-1.5", className)}>
      <span className="text-[13px] text-ink-500">{label}</span>
      <span className="leader__dots" aria-hidden />
      <span
        className={cn(
          "text-[13px] text-right",
          emphasis ? "font-medium text-ink-900" : "text-ink-700",
        )}
      >
        {value}
      </span>
    </div>
  );
}
