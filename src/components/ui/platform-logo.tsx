import { cn } from "@/lib/cn";
import type { Platform } from "@/lib/types";

/**
 * Brand wordmarks for the booking platforms. Both Resy and OpenTable use
 * wordmark logos, so we render their names in their brand typography/colour
 * rather than inventing glyphs. Used wherever a platform is referenced so the
 * association reads clearly throughout the app.
 */

const BRAND: Record<Platform, { text: string; className: string }> = {
  resy: {
    text: "resy",
    // Resy's lowercase, tightly-set wordmark in its signature red.
    className: "lowercase font-semibold tracking-[-0.03em] text-[#EC4339]",
  },
  opentable: {
    text: "OpenTable",
    // OpenTable's wordmark in its signature red.
    className: "font-semibold tracking-[-0.01em] text-[#DA3743]",
  },
};

export function PlatformLogo({
  platform,
  className,
}: {
  platform: Platform;
  className?: string;
}) {
  const brand = BRAND[platform];
  return (
    <span className={cn("inline-block font-sans align-middle leading-none", brand.className, className)}>
      {brand.text}
    </span>
  );
}

/** Small circular brand badge — a colored monogram, for avatars/icons. */
export function PlatformBadge({ platform, className }: { platform: Platform; className?: string }) {
  const color = platform === "resy" ? "bg-[#EC4339]" : "bg-[#DA3743]";
  const letter = platform === "resy" ? "r" : "O";
  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-full font-sans font-semibold text-ivory-50",
        color,
        className,
      )}
    >
      {letter}
    </span>
  );
}
