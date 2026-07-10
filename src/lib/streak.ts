/**
 * NetPrep Streak System
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

/**
 * Check if a streak should be incremented, reset, or unchanged
 */
export function calculateStreak(
  lastStudyDate: Date | null,
  currentStreak: number,
  longestStreak: number,
  tz: string = DEFAULT_TZ,
): {
  newStreak: number;
  newLongestStreak: number;
  streakBroken: boolean;
} {
  if (!lastStudyDate) {
    // First ever study session
    return {
      newStreak: 1,
      newLongestStreak: Math.max(longestStreak, 1),
      streakBroken: false,
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
    };
  }

  if (diffDays === 1) {
    // Consecutive day — increment streak
    const newStreak = currentStreak + 1;
    return {
      newStreak,
      newLongestStreak: Math.max(longestStreak, newStreak),
      streakBroken: false,
    };
  }

  // Gap of 2+ days — streak broken, restart at 1
  return {
    newStreak: 1,
    newLongestStreak: longestStreak,
    streakBroken: true,
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
