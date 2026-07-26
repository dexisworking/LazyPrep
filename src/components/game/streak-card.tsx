"use client";

import { AlertTriangle, Check, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  getNextMultiplierMilestone,
  getStreakStatus,
  getStreakStatusLabel,
  hasStudiedToday,
  isStreakAtRisk,
} from "@/lib/streak";
import { getStreakMultiplier } from "@/lib/xp";
import { AnimatedNumber } from "@/components/motion/motion";
import { GameCard } from "@/components/game/game-card";
import { FlameVector, GemVector } from "@/components/game/vectors";

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  streakFreezes: number;
  lastStudyDate: Date | null;
  timezone: string;
  className?: string;
}

/**
 * The daily-return hook.
 *
 * The flame is the focal point at 76px, not a 24px icon glyph — the streak is
 * the single most emotionally loaded number in the product and it should carry
 * visual weight to match.
 */
export function StreakCard({
  currentStreak,
  longestStreak,
  streakFreezes,
  lastStudyDate,
  timezone,
  className,
}: StreakCardProps) {
  const status = getStreakStatus(currentStreak);
  const statusLabel = getStreakStatusLabel(status);
  const studied = hasStudiedToday(lastStudyDate, timezone);
  const atRisk = !studied && isStreakAtRisk(lastStudyDate, timezone);
  const multiplier = getStreakMultiplier(currentStreak);
  const nextMilestone = getNextMultiplierMilestone(currentStreak);

  return (
    <GameCard tone="flame" className={cn("h-full", className)}>
      <div className="flex items-center gap-4">
        <FlameVector status={status} size={76} />

        <div className="min-w-0 flex-1">
          <p className="flex items-baseline gap-1.5 leading-none">
            <span className="text-4xl font-extrabold tabular-nums text-foreground">
              <AnimatedNumber value={currentStreak} />
            </span>
            <span className="text-sm font-bold text-muted-foreground">
              day{currentStreak === 1 ? "" : "s"}
            </span>
          </p>
          <p className="mt-1 text-xs font-bold uppercase tracking-wider text-game-flame">
            {statusLabel}
          </p>

          {studied ? (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-game-win/15 px-2.5 py-1 text-2xs font-bold text-game-win">
              <Check className="h-3 w-3" strokeWidth={3} />
              Studied today
            </span>
          ) : atRisk ? (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-game-flame/15 px-2.5 py-1 text-2xs font-bold text-game-flame animate-wiggle">
              <AlertTriangle className="h-3 w-3" />
              At risk
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t-2 border-border-subtle pt-3 text-xs font-bold">
        <span className="flex items-center gap-1.5 text-game-xp">
          {multiplier}× XP
          {nextMilestone && (
            <span className="font-semibold text-muted-foreground">
              · next at {nextMilestone.days}d
            </span>
          )}
        </span>
        <span className="flex items-center gap-3 text-muted-foreground">
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            {longestStreak}d
          </span>
          <span className="flex items-center gap-1">
            <GemVector size={14} />
            {streakFreezes}
          </span>
        </span>
      </div>
    </GameCard>
  );
}
