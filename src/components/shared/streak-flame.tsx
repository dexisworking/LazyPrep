import { Flame } from "lucide-react";

import { cn } from "@/lib/utils";
import type { getStreakStatus } from "@/lib/streak";

export type StreakStatus = ReturnType<typeof getStreakStatus>;

/**
 * The one streak colour ramp.
 *
 * This existed in five hand-maintained copies — `streak-card`, `streak-panel`,
 * `navbar`, `sidebar` and `profile/page` — all built from raw `amber-400` /
 * `orange-500` / `red-500`, all subtly disagreeing (400 vs 500 in the same
 * config, `/30` vs `/40` borders), and none of them theme-aware. It is now
 * driven by the `--streak-*` tokens.
 */
export const STREAK_TONE: Record<
  StreakStatus,
  { flame: string; text: string; bg: string; ring: string; tileBg: string }
> = {
  cold: {
    flame: "text-muted-foreground",
    text: "text-muted-foreground",
    bg: "bg-muted/40",
    ring: "border-border-subtle",
    tileBg: "bg-card/60",
  },
  warm: {
    flame: "text-streak-warm",
    text: "text-streak-warm",
    bg: "bg-streak-warm/5",
    ring: "border-streak-warm/30",
    tileBg: "bg-streak-warm/10",
  },
  hot: {
    flame: "text-streak-hot",
    text: "text-streak-hot",
    bg: "bg-streak-hot/5",
    ring: "border-streak-hot/30",
    tileBg: "bg-streak-hot/10",
  },
  fire: {
    flame: "text-streak-fire",
    text: "text-streak-fire",
    bg: "bg-streak-fire/5",
    ring: "border-streak-fire/30",
    tileBg: "bg-streak-fire/10",
  },
};

/** Pill tone matching a streak status, for use with `<Pill tone={…}>`. */
export const STREAK_PILL_TONE = {
  cold: "muted",
  warm: "streak-warm",
  hot: "streak-hot",
  fire: "streak-fire",
} as const;

/**
 * The flame glyph.
 *
 * At `fire` it breathes rather than `animate-pulse`-ing: the old treatment
 * blinked the whole icon to 50% opacity twice a second, which read as a broken
 * loading state next to an at-risk badge that was also pulsing.
 */
export function StreakFlame({
  status,
  className,
  animated = true,
}: {
  status: StreakStatus;
  className?: string;
  animated?: boolean;
}) {
  return (
    <Flame
      aria-hidden
      className={cn(
        "shrink-0",
        STREAK_TONE[status].flame,
        status === "fire" && animated && "animate-streak-breathe",
        className,
      )}
    />
  );
}
