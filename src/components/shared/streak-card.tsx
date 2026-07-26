"use client";

import { AlertTriangle, Check, Shield, Zap, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getStreakStatus,
  getStreakStatusLabel,
  getNextMultiplierMilestone,
  hasStudiedToday,
  isStreakAtRisk,
  STREAK_MULTIPLIER_TIERS,
} from "@/lib/streak";
import { getStreakMultiplier } from "@/lib/xp";
import { AnimatedNumber, SlideUp } from "@/components/motion/motion";
import { Pill } from "@/components/shared/pill";
import { ProgressBar } from "@/components/shared/progress-bar";
import { STREAK_TONE, StreakFlame } from "@/components/shared/streak-flame";

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  streakFreezes: number;
  lastStudyDate: Date | null;
  timezone: string;
}

export function StreakCard({
  currentStreak,
  longestStreak,
  streakFreezes,
  lastStudyDate,
  timezone,
}: StreakCardProps) {
  const status = getStreakStatus(currentStreak);
  const statusLabel = getStreakStatusLabel(status);
  const studied = hasStudiedToday(lastStudyDate, timezone);
  const atRisk = !studied && isStreakAtRisk(lastStudyDate, timezone);
  const multiplier = getStreakMultiplier(currentStreak);
  const nextMilestone = getNextMultiplierMilestone(currentStreak);
  const cfg = STREAK_TONE[status];

  // Progress toward next multiplier tier
  const prevTierDays =
    [...STREAK_MULTIPLIER_TIERS].reverse().find((t) => currentStreak >= t.days)?.days ?? 0;
  const tierProgress = nextMilestone
    ? Math.min(
        100,
        Math.round(
          ((currentStreak - prevTierDays) / (nextMilestone.days - prevTierDays)) * 100,
        ),
      )
    : 100;

  return (
    <SlideUp
      className={cn("relative overflow-hidden rounded-card border p-card", cfg.ring, cfg.bg)}
    >
      {/* Top row: flame + count */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-control border",
              cfg.ring,
              cfg.tileBg,
            )}
          >
            <StreakFlame status={status} className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground leading-none">
              <AnimatedNumber value={currentStreak} />
              <span className="ml-1 text-sm font-medium text-muted-foreground">
                day{currentStreak !== 1 ? "s" : ""}
              </span>
            </p>
            <p className="mt-0.5 text-xs font-medium text-muted-foreground">
              {statusLabel}
            </p>
          </div>
        </div>

        {/* Status badge. Glyphs are lucide icons now, not literal ✓/⚠ text, and
            the at-risk pill no longer pulses alongside a lit flame. */}
        {studied ? (
          <Pill tone="success" size="sm" icon={Check}>
            Studied today
          </Pill>
        ) : atRisk ? (
          <Pill tone="streak-warm" size="sm" icon={AlertTriangle}>
            Streak at risk
          </Pill>
        ) : null}
      </div>

      {/* XP multiplier bar */}
      <div className="mt-4 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 font-medium text-foreground">
            <Zap className="h-3.5 w-3.5 text-np-xp" />
            {multiplier}× XP bonus
          </span>
          {nextMilestone ? (
            <span className="text-muted-foreground">
              {nextMilestone.label} at {nextMilestone.days}d
            </span>
          ) : (
            <span className="font-semibold text-np-xp">Max tier!</span>
          )}
        </div>
        <ProgressBar
          value={tierProgress}
          tone="xp"
          aria-label="Progress to next XP multiplier tier"
        />
      </div>

      {/* Bottom row: longest streak + freezes */}
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <TrendingUp className="h-3.5 w-3.5" />
          Best: {longestStreak}d
        </span>
        <span className="flex items-center gap-1">
          <Shield className="h-3.5 w-3.5 text-primary" />
          {streakFreezes} freeze{streakFreezes !== 1 ? "s" : ""} left
        </span>
      </div>
    </SlideUp>
  );
}
