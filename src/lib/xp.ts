/**
 * NetPrep XP System
 *
 * XP Sources:
 * - Lesson completed: 10 XP
 * - MCQ correct: 5 XP
 * - MCQ incorrect: 1 XP (participation)
 * - Flashcard reviewed: 2 XP
 * - Daily login: 5 XP
 * - Practice test completed: 20 XP
 * - Streak bonus (7+ days): 2x multiplier
 */

export const XP_REWARDS = {
  LESSON_COMPLETE: 10,
  MCQ_CORRECT: 5,
  MCQ_INCORRECT: 1,
  FLASHCARD_REVIEW: 2,
  DAILY_LOGIN: 5,
  PRACTICE_TEST: 20,
} as const;

/**
 * Level thresholds — each level requires more XP than the last
 * Formula: level N requires N * 100 total XP
 * L1=0, L2=100, L3=300, L4=600, L5=1000, L6=1500, ...
 */
export function getLevelFromXp(xp: number): number {
  let level = 1;
  let threshold = 0;
  while (threshold + level * 100 <= xp) {
    threshold += level * 100;
    level++;
  }
  return level;
}

/**
 * Get XP progress within the current level
 */
export function getLevelProgress(xp: number): {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progress: number;
} {
  let level = 1;
  let threshold = 0;
  while (threshold + level * 100 <= xp) {
    threshold += level * 100;
    level++;
  }

  const currentLevelXp = xp - threshold;
  const nextLevelXp = level * 100;
  const progress = Math.min((currentLevelXp / nextLevelXp) * 100, 100);

  return { level, currentLevelXp, nextLevelXp, progress };
}

/**
 * Rank titles based on level
 */
export function getRank(level: number): string {
  if (level >= 50) return "Network Architect";
  if (level >= 40) return "Senior Engineer";
  if (level >= 30) return "Routing Engineer";
  if (level >= 20) return "Switch Specialist";
  if (level >= 10) return "Network Apprentice";
  if (level >= 5) return "Protocol Explorer";
  return "Beginner";
}

/**
 * Calculate streak bonus multiplier
 */
export function getStreakMultiplier(streak: number): number {
  if (streak >= 30) return 3;
  if (streak >= 14) return 2.5;
  if (streak >= 7) return 2;
  if (streak >= 3) return 1.5;
  return 1;
}
