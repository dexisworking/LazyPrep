"use client";

import { Check, Shield, TrendingUp, Zap } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  getNextMultiplierMilestone,
  getStreakStatus,
  getStreakStatusLabel,
  hasStudiedToday,
  isStreakAtRisk,
  STREAK_MULTIPLIER_TIERS,
} from "@/lib/streak";
import { getStreakMultiplier } from "@/lib/xp";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { InlineAlert } from "@/components/shared/inline-alert";
import { FlameVector, GemVector } from "@/components/game/vectors";

interface StreakDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStreak: number;
  longestStreak: number;
  streakFreezes: number;
  lastStudyDate: Date | null;
  timezone: string;
}

/**
 * Streak detail, as a centred modal.
 *
 * This was an `absolute right-0 top-full` popover anchored to the navbar chip,
 * which put a fixed 320px panel inside the header's stacking context — it
 * collided with page content and clipped off-screen on narrow viewports. A
 * portalled dialog sits above everything and centres itself, and Base UI gives
 * focus trapping, Escape and scroll-lock for free.
 */
export function StreakDialog({
  open,
  onOpenChange,
  currentStreak,
  longestStreak,
  streakFreezes,
  lastStudyDate,
  timezone,
}: StreakDialogProps) {
  const status = getStreakStatus(currentStreak);
  const statusLabel = getStreakStatusLabel(status);
  const studied = hasStudiedToday(lastStudyDate, timezone);
  const atRisk = !studied && isStreakAtRisk(lastStudyDate, timezone);
  const multiplier = getStreakMultiplier(currentStreak);
  const nextMilestone = getNextMultiplierMilestone(currentStreak);

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 rounded-3xl border-2 border-game-flame/40 p-0 sm:max-w-md">
        <div className="flex flex-col items-center gap-3 px-6 pb-5 pt-8 text-center">
          <FlameVector status={status} size={92} />
          <div>
            <DialogTitle className="text-5xl font-extrabold tabular-nums tracking-tight text-foreground">
              {currentStreak}
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm font-bold uppercase tracking-wider text-game-flame">
              day{currentStreak === 1 ? "" : "s"} · {statusLabel}
            </DialogDescription>
          </div>
        </div>

        <div className="space-y-4 border-t-2 border-border-subtle p-5">
          {studied ? (
            <InlineAlert tone="success" icon={Check}>
              You&apos;ve studied today — your streak is safe.
            </InlineAlert>
          ) : atRisk ? (
            <InlineAlert tone="warning">
              Study today to keep your streak alive.
            </InlineAlert>
          ) : null}

          {/* Multiplier ladder */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-foreground">
                <Zap className="h-4 w-4 text-game-xp" />
                {multiplier}× XP multiplier
              </span>
              {nextMilestone ? (
                <span className="text-muted-foreground">
                  {nextMilestone.label} at {nextMilestone.days}d
                </span>
              ) : (
                <span className="text-game-xp">Max tier</span>
              )}
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-game-xp transition-[width] duration-(--dur-celebrate) ease-emphasized motion-reduce:transition-none"
                style={{ width: `${tierProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-3xs font-semibold tabular-nums">
              {STREAK_MULTIPLIER_TIERS.map((tier) => (
                <span
                  key={tier.days}
                  className={cn(
                    currentStreak >= tier.days ? "text-game-xp" : "text-muted-foreground/60",
                  )}
                >
                  {tier.days}d
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border-2 border-border-subtle bg-secondary/40 p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="text-2xs font-bold">Best streak</span>
              </div>
              <p className="mt-1 text-xl font-extrabold tabular-nums text-foreground">
                {longestStreak}
                <span className="text-xs font-bold text-muted-foreground">d</span>
              </p>
            </div>
            <div className="rounded-2xl border-2 border-border-subtle bg-secondary/40 p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <Shield className="h-3.5 w-3.5 text-game-gem" />
                <span className="text-2xs font-bold">Freezes</span>
              </div>
              <p className="mt-1 flex items-center justify-center gap-1 text-xl font-extrabold tabular-nums text-foreground">
                <GemVector size={16} />
                {streakFreezes}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
