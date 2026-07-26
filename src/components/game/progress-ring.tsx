import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const tones = {
  xp: "var(--game-xp)",
  flame: "var(--game-flame)",
  gem: "var(--game-gem)",
  win: "var(--game-win)",
  epic: "var(--game-epic)",
  primary: "var(--primary)",
} as const;

export type ProgressRingProps = {
  /** 0–100. */
  value: number;
  size?: number;
  thickness?: number;
  tone?: keyof typeof tones;
  /** Rendered dead-centre inside the ring. */
  children?: ReactNode;
  /** Soft coloured glow behind the ring. Reserve for "lit" states. */
  glow?: boolean;
  label?: string;
  className?: string;
};

/**
 * Circular progress — the daily-goal / level dial of the HUD.
 *
 * A ring reads as "how close am I to closing this" far more immediately than a
 * bar does, which is why every goal-driven study app uses one. Server-safe:
 * the fill is a static `stroke-dashoffset` with a CSS transition, so it
 * animates on value change without needing a client component.
 */
export function ProgressRing({
  value,
  size = 120,
  thickness = 10,
  tone = "xp",
  children,
  glow = false,
  label,
  className,
}: ProgressRingProps) {
  const pct = Math.min(100, Math.max(0, value));
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;
  const stroke = tones[tone];

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      {glow && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-full blur-xl animate-halo"
          style={{ background: stroke, opacity: 0.4 }}
        />
      )}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="relative -rotate-90"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={thickness}
          strokeLinecap="round"
          className="stroke-secondary"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset var(--dur-celebrate) var(--ease-emphasized)",
          }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-none">
          {children}
        </div>
      )}
    </div>
  );
}
