"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Flame,
  Shield,
  ShieldPlus,
  Zap,
  TrendingUp,
  X,
} from "lucide-react";
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

const statusConfig = {
  cold: { flame: "text-muted-foreground", accent: "border-border/50" },
  warm: { flame: "text-amber-400", accent: "border-amber-400/40" },
  hot: { flame: "text-orange-500", accent: "border-orange-400/40" },
  fire: { flame: "text-red-500 animate-pulse", accent: "border-red-500/40" },
} as const;

interface StreakPanelProps {
  open: boolean;
  onClose: () => void;
  currentStreak: number;
  longestStreak: number;
  streakFreezes: number;
  lastStudyDate: Date | null;
  timezone: string;
}

export function StreakPanel({
  open,
  onClose,
  currentStreak,
  longestStreak,
  streakFreezes,
  lastStudyDate,
  timezone,
}: StreakPanelProps) {
  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const status = getStreakStatus(currentStreak);
  const statusLabel = getStreakStatusLabel(status);
  const studied = hasStudiedToday(lastStudyDate, timezone);
  const atRisk = !studied && isStreakAtRisk(lastStudyDate, timezone);
  const multiplier = getStreakMultiplier(currentStreak);
  const nextMilestone = getNextMultiplierMilestone(currentStreak);
  const cfg = statusConfig[status];

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
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.96 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className={cn(
            "absolute right-0 top-full mt-2 z-50 w-80 rounded-xl border bg-card shadow-xl shadow-black/10",
            cfg.accent,
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
            <div className="flex items-center gap-2">
              <Flame className={cn("h-5 w-5", cfg.flame)} />
              <span className="text-sm font-bold text-foreground">Your Streak</span>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4 p-4">
            {/* Streak count */}
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-xl border",
                  cfg.accent,
                  status === "fire" ? "bg-red-500/10" : "bg-secondary/60",
                )}
              >
                <Flame className={cn("h-7 w-7", cfg.flame)} />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground leading-none">
                  {currentStreak}
                  <span className="ml-1 text-sm font-medium text-muted-foreground">
                    day{currentStreak !== 1 ? "s" : ""}
                  </span>
                </p>
                <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                  {statusLabel}
                </p>
              </div>
            </div>

            {/* Status indicator */}
            {studied ? (
              <div className="rounded-lg border border-np-success/20 bg-np-success/5 px-3 py-2 text-xs font-medium text-np-success">
                ✓ You&apos;ve studied today — streak is safe!
              </div>
            ) : atRisk ? (
              <div className="rounded-lg border border-amber-400/20 bg-amber-500/5 px-3 py-2 text-xs font-medium text-amber-500">
                ⚠ Study today to keep your streak alive!
              </div>
            ) : null}

            {/* XP multiplier */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 font-semibold text-foreground">
                  <Zap className="h-3.5 w-3.5 text-np-xp" />
                  {multiplier}× XP multiplier
                </span>
                {nextMilestone ? (
                  <span className="text-muted-foreground">
                    Next: {nextMilestone.label} at {nextMilestone.days}d
                  </span>
                ) : (
                  <span className="font-semibold text-np-xp">Max tier! 🔥</span>
                )}
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-np-xp transition-all duration-500"
                  style={{ width: `${tierProgress}%` }}
                />
              </div>
              {/* Tier labels */}
              <div className="flex justify-between text-[10px] text-muted-foreground/70">
                {STREAK_MULTIPLIER_TIERS.map((tier) => (
                  <span
                    key={tier.days}
                    className={cn(
                      currentStreak >= tier.days && "font-semibold text-np-xp",
                    )}
                  >
                    {tier.days}d
                  </span>
                ))}
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border/40 bg-secondary/30 p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-medium">Best Streak</span>
                </div>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {longestStreak}
                  <span className="text-xs font-normal text-muted-foreground">d</span>
                </p>
              </div>
              <div className="rounded-lg border border-border/40 bg-secondary/30 p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground">
                  <Shield className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-[10px] font-medium">Freezes Left</span>
                </div>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {streakFreezes}
                </p>
              </div>
            </div>

            {/* Buy freezes CTA (paywall placeholder) */}
            {streakFreezes < 3 && (
              <button
                disabled
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-400/20 bg-blue-500/5 px-3 py-2.5 text-xs font-semibold text-blue-400 transition-colors hover:bg-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                title="Coming soon"
              >
                <ShieldPlus className="h-4 w-4" />
                Buy More Freezes — Coming Soon
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
