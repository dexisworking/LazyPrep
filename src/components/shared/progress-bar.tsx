import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const trackSizes = {
  xs: "h-1",
  sm: "h-1.5",
  md: "h-2",
} as const;

const toneFills = {
  primary: "bg-primary",
  success: "bg-np-success",
  xp: "bg-np-xp",
  streak: "bg-streak-hot",
  destructive: "bg-destructive",
} as const;

export type ProgressBarProps = {
  value: number;
  max?: number;
  size?: keyof typeof trackSizes;
  tone?: keyof typeof toneFills;
  /** Optional caption row above the bar. */
  label?: ReactNode;
  /** Right-hand caption, e.g. "12 / 40". */
  hint?: ReactNode;
  /** Announce the value to assistive tech. Off for purely decorative bars. */
  "aria-label"?: string;
  className?: string;
  trackClassName?: string;
};

/**
 * The one progress bar.
 *
 * Replaces twelve hand-rolled two-div bars that disagreed on height
 * (h-1 / h-1.5 / h-2), on transition (none / `transition-all` / `duration-500`)
 * and on whether the fill was rounded.
 *
 * A plain `div` rather than the Base UI `Progress` primitive: this renders in
 * server components, and the ARIA it needs is one `role="progressbar"`.
 */
export function ProgressBar({
  value,
  max = 100,
  size = "sm",
  tone = "primary",
  label,
  hint,
  className,
  trackClassName,
  "aria-label": ariaLabel,
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div className={cn("space-y-1.5", className)}>
      {(label || hint) && (
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          {label}
          {hint}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel}
        className={cn(
          "w-full overflow-hidden rounded-full bg-secondary",
          trackSizes[size],
          trackClassName,
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-(--dur-slow) ease-emphasized motion-reduce:transition-none",
            toneFills[tone],
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
