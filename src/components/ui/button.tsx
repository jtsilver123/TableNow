import Link from "next/link";
import { forwardRef } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-sage-500 text-ivory-50 hover:bg-sage-600 active:bg-sage-700 shadow-card border border-sage-600/30",
  secondary:
    "bg-ivory-50 text-ink-800 border border-line hover:border-ink-300 hover:bg-ivory-100",
  ghost: "text-ink-600 hover:text-ink-900 hover:bg-ivory-200/70",
  danger: "bg-clay-500 text-ivory-50 hover:bg-clay-600 border border-clay-600/30",
};

const SIZE: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[13px] rounded-lg",
  md: "h-11 px-5 text-sm rounded-xl",
  lg: "h-12 px-6 text-[15px] rounded-xl",
};

const base =
  "inline-flex items-center justify-center gap-2 font-medium transition-colors focus-ring disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className, ...props },
  ref,
) {
  return (
    <button ref={ref} className={cn(base, VARIANT[variant], SIZE[size], className)} {...props} />
  );
});

interface LinkButtonProps extends React.ComponentProps<typeof Link> {
  variant?: Variant;
  size?: Size;
}

export function LinkButton({
  variant = "primary",
  size = "md",
  className,
  ...props
}: LinkButtonProps) {
  return <Link className={cn(base, VARIANT[variant], SIZE[size], className)} {...props} />;
}
