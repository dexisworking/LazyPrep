"use client";

import { Flame, Shield, Zap, TrendingUp } from "lucide-react";
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

const statusConfig = {
  cold: { flame: "text-muted-foreground", bg: "bg-muted/50", ring: "border-border/50" },
  warm: { flame: "text-amber-400", bg: "bg-amber-500/5", ring: "border-amber-400/30" },
  hot: { flame: "text-orange-500", bg: "bg-orange-500/5", ring: "border-orange-400/30" },
  fire: { flame: "text-red-500 animate-pulse", bg: "bg-red-500/5", ring: "border-red-500/30" },
} as const;

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
  const cfg = statusConfig[status];

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
      className={cn(
        "relative overflow-hidden rounded-xl border p-5",
        cfg.ring,
        cfg.bg,
      )}
    >
      {/* Top row: flame + count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-lg border",
              cfg.ring,
              status === "fire" ? "bg-red-500/10" : "bg-card/60",
            )}
          >
            <Flame className={cn("h-6 w-6", cfg.flame)} />
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

        {/* Status badge */}
        <div className="text-right space-y-1">
          {studied ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-np-success/10 border border-np-success/20 px-2.5 py-0.5 text-[10px] font-semibold text-np-success">
              ✓ Studied today
            </span>
          ) : atRisk ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-400/20 px-2.5 py-0.5 text-[10px] font-semibold text-amber-500 animate-pulse">
              ⚠ Streak at risk
            </span>
          ) : null}
        </div>
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
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-np-xp transition-all duration-500"
            style={{ width: `${tierProgress}%` }}
          />
        </div>
      </div>

      {/* Bottom row: longest streak + freezes */}
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <TrendingUp className="h-3.5 w-3.5" />
          Best: {longestStreak}d
        </span>
        <span className="flex items-center gap-1">
          <Shield className="h-3.5 w-3.5 text-blue-400" />
          {streakFreezes} freeze{streakFreezes !== 1 ? "s" : ""} left
        </span>
      </div>
    </SlideUp>
  );
}
