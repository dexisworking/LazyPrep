import { cn } from "@/lib/utils";
import type { StreakStatus } from "@/components/shared/streak-flame";

/**
 * Hand-built game vectors.
 *
 * These are deliberately NOT lucide icons. Lucide is a 1.5px-stroke UI icon set
 * — correct for nav and buttons, but it renders a streak flame as a thin
 * outline that carries no weight. These are filled, multi-tone shapes sized to
 * be the focal point of a card.
 */

/** Per-tier flame colouring. Cold is a dead ember; fire is fully lit. */
const FLAME_TIERS: Record<StreakStatus, { outer: string; inner: string; core: string; lit: boolean }> = {
  cold: { outer: "var(--muted-foreground)", inner: "var(--muted-foreground)", core: "var(--muted)", lit: false },
  warm: { outer: "var(--streak-warm)", inner: "var(--game-xp)", core: "var(--game-xp)", lit: true },
  hot: { outer: "var(--game-flame)", inner: "var(--streak-warm)", core: "var(--game-xp)", lit: true },
  fire: { outer: "var(--game-loss)", inner: "var(--game-flame)", core: "var(--game-xp)", lit: true },
};

export function FlameVector({
  status,
  size = 64,
  className,
  animated = true,
}: {
  status: StreakStatus;
  size?: number;
  className?: string;
  animated?: boolean;
}) {
  const t = FLAME_TIERS[status];
  return (
    <span
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      {t.lit && (
        <span
          aria-hidden
          className={cn(
            "absolute inset-0 rounded-full blur-lg",
            animated && "animate-halo",
          )}
          style={{ background: t.outer, opacity: 0.35 }}
        />
      )}
      <svg
        viewBox="0 0 48 48"
        width={size}
        height={size}
        aria-hidden
        className={cn("relative", t.lit && animated && "animate-flame")}
        style={{ transformOrigin: "50% 75%" }}
      >
        {/* Outer body */}
        <path
          d="M24 3c1.4 6.6-2.3 10.2-6 13.7-3.9 3.7-7.9 7.4-7.9 14.5C10.1 39 16.4 45 24 45s13.9-6 13.9-13.8c0-5.6-2.6-8.9-5.4-12-2.2 1.6-3.9 1.9-5 1.6 2.4-4.7 1.6-11.4-3.5-18.8Z"
          fill={t.outer}
        />
        {/* Mid tongue */}
        <path
          d="M24 18c1 4.3-1.6 6.6-4 8.9-2.6 2.4-5.2 4.8-5.2 9.4 0 5 4.2 8.9 9.2 8.9s9.2-3.9 9.2-8.9c0-3.6-1.7-5.8-3.6-7.8-1.4 1-2.5 1.2-3.3 1 1.6-3 1.1-7.4-2.3-11.5Z"
          fill={t.inner}
          opacity={0.9}
        />
        {/* Hot core */}
        <ellipse cx="24" cy="36" rx="4.6" ry="6" fill={t.core} opacity={t.lit ? 0.95 : 0.4} />
      </svg>
    </span>
  );
}

/**
 * Rank medal. `tier` 0-4 maps to the rank ladder; higher tiers gain points on
 * the star and a richer metal.
 */
const MEDAL_TIERS = [
  { metal: "var(--muted-foreground)", edge: "var(--border-strong)", star: "var(--surface-2)" },
  { metal: "var(--game-win)", edge: "var(--game-win-deep)", star: "var(--game-on-solid)" },
  { metal: "var(--game-gem)", edge: "var(--game-gem-deep)", star: "var(--game-on-solid)" },
  { metal: "var(--game-xp)", edge: "var(--game-xp-deep)", star: "var(--game-on-solid)" },
  { metal: "var(--game-epic)", edge: "var(--game-epic-deep)", star: "var(--game-on-solid)" },
];

export function RankMedal({
  tier = 0,
  size = 44,
  className,
}: {
  tier?: number;
  size?: number;
  className?: string;
}) {
  const t = MEDAL_TIERS[Math.min(MEDAL_TIERS.length - 1, Math.max(0, tier))];
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      aria-hidden
      className={cn("shrink-0", className)}
    >
      {/* Shield */}
      <path
        d="M24 3.5 41 9.2v14.4c0 10.2-7 17.6-17 21.1-10-3.5-17-10.9-17-21.1V9.2L24 3.5Z"
        fill={t.edge}
      />
      <path
        d="M24 7 37.6 11.6v12c0 8.3-5.6 14.4-13.6 17.4-8-3-13.6-9.1-13.6-17.4v-12L24 7Z"
        fill={t.metal}
      />
      {/* Star */}
      <path
        d="m24 15.4 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L24 15.4Z"
        fill={t.star}
      />
    </svg>
  );
}

/** Faceted gem, used for the streak-freeze currency. */
export function GemVector({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden className={cn("shrink-0", className)}>
      <path d="M7 3h10l5 6-10 12L2 9l5-6Z" fill="var(--game-gem)" />
      <path d="M7 3h10l-5 6-5-6Z" fill="var(--game-gem-deep)" opacity={0.55} />
      <path d="M2 9h20L12 21 2 9Z" fill="var(--game-gem)" opacity={0.75} />
      <path d="m12 9-5 12L2 9h10Z" fill="var(--game-gem-deep)" opacity={0.3} />
    </svg>
  );
}

/** XP token. Reads as a coin rather than a lightning bolt icon. */
export function XpOrb({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden className={cn("shrink-0", className)}>
      <circle cx="12" cy="12" r="10" fill="var(--game-xp-deep)" />
      <circle cx="12" cy="11" r="8.5" fill="var(--game-xp)" />
      <path d="M13.2 5.5 7 13.2h4l-.4 5.3 6.2-7.7h-4l.4-5.3Z" fill="var(--game-on-solid)" opacity={0.85} />
    </svg>
  );
}
