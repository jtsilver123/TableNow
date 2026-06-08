import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export function Label({
  children,
  htmlFor,
  hint,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  hint?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline justify-between">
      <span className="text-[13px] font-medium text-ink-700">{children}</span>
      {hint && <span className="text-[11px] text-ink-400">{hint}</span>}
    </label>
  );
}

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn("input-base", className)} {...props} />;
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn("input-base min-h-[88px] resize-none", className)} {...props} />;
});

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn("input-base appearance-none pr-9", className)}
          {...props}
        >
          {children}
        </select>
        <svg
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    );
  },
);

/** Segmented control for small enum choices (flexibility, priority, etc.). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex w-full rounded-xl border border-line bg-ivory-100 p-1",
        className,
      )}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex-1 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors focus-ring",
            value === opt.value
              ? "bg-ivory-50 text-ink-900 shadow-sm ring-1 ring-line"
              : "text-ink-500 hover:text-ink-800",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
