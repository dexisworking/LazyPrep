/**
 * Pure study-planner math — no DB, no server-only imports, safe on client &
 * server (and unit-testable). Turns an exam date + remaining work into a simple
 * "what to do today" target. Deterministic; no AI needed.
 */

/** Whole days from now (start of today) until `examDate` (00:00). Negative = past. */
export function daysUntil(examDate: Date, now: Date = new Date()): number {
  const a = new Date(now);
  a.setHours(0, 0, 0, 0);
  const b = new Date(examDate);
  b.setHours(0, 0, 0, 0);
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

export type DailyTarget = {
  daysLeft: number; // clamped at 0 (exam is today or past)
  lessonsPerDay: number; // lessons to cover today to stay on pace
  reviewsToday: number; // spaced-repetition questions already due
  overdue: boolean; // exam date is today or in the past
};

/**
 * Spread remaining lessons across the days left; reviews are whatever's due now.
 * - Exam today/past → cram everything remaining today.
 * - Otherwise → ceil(remaining / daysLeft) lessons/day.
 */
export function computeDailyTarget(
  remainingLessons: number,
  dueReviews: number,
  daysUntilExam: number,
): DailyTarget {
  const remaining = Math.max(0, remainingLessons);
  const reviews = Math.max(0, dueReviews);

  if (daysUntilExam <= 0) {
    return { daysLeft: 0, lessonsPerDay: remaining, reviewsToday: reviews, overdue: true };
  }
  return {
    daysLeft: daysUntilExam,
    lessonsPerDay: Math.ceil(remaining / daysUntilExam),
    reviewsToday: reviews,
    overdue: false,
  };
}

/** Human countdown label, e.g. "Exam today", "Exam tomorrow", "Exam in 23 days". */
export function formatCountdown(daysLeft: number): string {
  if (daysLeft < 0) return "Exam date passed";
  if (daysLeft === 0) return "Exam today";
  if (daysLeft === 1) return "Exam tomorrow";
  return `Exam in ${daysLeft} days`;
}
