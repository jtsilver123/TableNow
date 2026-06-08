import { cn } from "@/lib/cn";

/** Calm, editorial empty state with an optional action. */
export function EmptyState({
  title,
  body,
  action,
  icon,
  className,
}: {
  title: string;
  body?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-ivory-50/50 px-6 py-16 text-center",
        className,
      )}
    >
      {icon && (
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-sage-100 text-sage-600">
          {icon}
        </div>
      )}
      <h3 className="font-serif text-2xl text-ink-900">{title}</h3>
      {body && <p className="mt-2 max-w-sm text-sm text-ink-500">{body}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
