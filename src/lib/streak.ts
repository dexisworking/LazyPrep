/**
 * NetPrep Streak System
 *
 * Streaks track consecutive study days.
 * A day counts if the user completes at least one activity:
 * - Read a lesson
 * - Answer a question
 * - Review a flashcard
 */

/**
 * Check if a streak should be incremented, reset, or unchanged
 */
export function calculateStreak(
  lastStudyDate: Date | null,
  currentStreak: number,
  longestStreak: number,
): {
  newStreak: number;
  newLongestStreak: number;
  streakBroken: boolean;
} {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (!lastStudyDate) {
    // First ever study session
    return {
      newStreak: 1,
      newLongestStreak: Math.max(longestStreak, 1),
      streakBroken: false,
    };
  }

  const lastDate = new Date(
    lastStudyDate.getFullYear(),
    lastStudyDate.getMonth(),
    lastStudyDate.getDate(),
  );

  const diffMs = today.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
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
