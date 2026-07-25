/**
 * LazyPrep Streak System
 *
 * Streaks track consecutive study days.
 * A day counts if the user completes at least one activity:
 * - Read a lesson
 * - Answer a question
 * - Review a flashcard
 *
 * "Day" boundaries are evaluated in the user's own timezone (`tz`) so late-night
 * study lands on the correct calendar day. See {@link ./day}.
 */

import { dayKey, daysBetweenKeys, DEFAULT_TZ } from "@/lib/day";

export const STREAK_MULTIPLIER_TIERS = [
  { days: 3, multiplier: 1.5, label: "1.5× XP" },
  { days: 7, multiplier: 2, label: "2× XP" },
  { days: 14, multiplier: 2.5, label: "2.5× XP" },
  { days: 30, multiplier: 3, label: "3× XP" },
] as const;

/**
 * Check if a streak should be incremented, reset, or unchanged
 */
export function calculateStreak(
  lastStudyDate: Date | null,
  currentStreak: number,
  longestStreak: number,
  tz: string = DEFAULT_TZ,
  streakFreezesAvailable: number = 0,
): {
  newStreak: number;
  newLongestStreak: number;
  streakBroken: boolean;
  freezeUsed: boolean;
  remainingFreezes: number;
} {
  if (!lastStudyDate) {
    // First ever study session
    return {
      newStreak: 1,
      newLongestStreak: Math.max(longestStreak, 1),
      streakBroken: false,
      freezeUsed: false,
      remainingFreezes: streakFreezesAvailable,
    };
  }

  const todayKey = dayKey(new Date(), tz);
  const lastKey = dayKey(lastStudyDate, tz);
  const diffDays = daysBetweenKeys(lastKey, todayKey);

  if (diffDays <= 0) {
    // Already studied today — no change
    return {
      newStreak: currentStreak,
      newLongestStreak: longestStreak,
      streakBroken: false,
      freezeUsed: false,
      remainingFreezes: streakFreezesAvailable,
    };
  }

  if (diffDays === 1) {
    // Consecutive day — increment streak
    const newStreak = currentStreak + 1;
    return {
      newStreak,
      newLongestStreak: Math.max(longestStreak, newStreak),
      streakBroken: false,
      freezeUsed: false,
      remainingFreezes: streakFreezesAvailable,
    };
  }

  // Gap of 2 days (missed 1 day) and has available streak freeze → consume freeze & maintain streak
  if (diffDays === 2 && streakFreezesAvailable > 0) {
    const newStreak = currentStreak + 1;
    return {
      newStreak,
      newLongestStreak: Math.max(longestStreak, newStreak),
      streakBroken: false,
      freezeUsed: true,
      remainingFreezes: streakFreezesAvailable - 1,
    };
  }

  // Gap of 2+ days — streak broken, restart at 1
  return {
    newStreak: 1,
    newLongestStreak: longestStreak,
    streakBroken: true,
    freezeUsed: false,
    remainingFreezes: streakFreezesAvailable,
  };
}

/**
 * Format streak for display
 */
export function formatStreak(streak: number): string {
  if (streak === 0) return "Start your streak!";
  if (streak === 1) return "1 day";
  return `${streak} days`;
}

/**
 * Get streak status emoji/icon hint
 */
export function getStreakStatus(streak: number): "cold" | "warm" | "hot" | "fire" {
  if (streak >= 14) return "fire";
  if (streak >= 7) return "hot";
  if (streak >= 3) return "warm";
  return "cold";
}

export function getStreakStatusLabel(status: ReturnType<typeof getStreakStatus>): string {
  switch (status) {
    case "fire":
      return "On fire!";
    case "hot":
      return "Heating up";
    case "warm":
      return "Building momentum";
    default:
      return "Just getting started";
  }
}

/** True if the user already logged qualifying study activity today. */
export function hasStudiedToday(lastStudyDate: Date | null, tz: string = DEFAULT_TZ): boolean {
  if (!lastStudyDate) return false;
  return dayKey(lastStudyDate, tz) === dayKey(new Date(), tz);
}

/** True when the user studied yesterday but not yet today — streak resets at midnight. */
export function isStreakAtRisk(lastStudyDate: Date | null, tz: string = DEFAULT_TZ): boolean {
  if (!lastStudyDate) return false;
  const diff = daysBetweenKeys(dayKey(lastStudyDate, tz), dayKey(new Date(), tz));
  return diff === 1;
}

/** Next XP multiplier milestone above the current streak (null if max tier reached). */
export function getNextMultiplierMilestone(
  streak: number,
): (typeof STREAK_MULTIPLIER_TIERS)[number] | null {
  return STREAK_MULTIPLIER_TIERS.find((tier) => streak < tier.days) ?? null;
}
