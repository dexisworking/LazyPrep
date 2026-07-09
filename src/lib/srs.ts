/**
 * SM-2 spaced-repetition scheduling (SuperMemo 2), Anki-style 4-grade variant.
 * Cards you know get exponentially longer intervals; cards you miss reset.
 */

export type ReviewGrade = "again" | "hard" | "good" | "easy";

// Map the 4 buttons onto SM-2 quality scores (0–5).
const QUALITY: Record<ReviewGrade, number> = {
  again: 1,
  hard: 3,
  good: 4,
  easy: 5,
};

export type SrsState = {
  easeFactor: number;
  interval: number; // days
  repetitions: number;
  lapses: number;
};

export const INITIAL_SRS: SrsState = {
  easeFactor: 2.5,
  interval: 0,
  repetitions: 0,
  lapses: 0,
};

export type SrsResult = SrsState & { dueDate: Date };

export function scheduleNext(state: SrsState, grade: ReviewGrade): SrsResult {
  const q = QUALITY[grade];
  let { easeFactor, interval, repetitions, lapses } = state;

  if (q < 3) {
    // Lapse — reset the card, see it again tomorrow.
    repetitions = 0;
    lapses += 1;
    interval = 1;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;

    // "hard" recalled but with effort — dampen the interval, drop ease slightly.
    if (grade === "hard") interval = Math.max(1, Math.round(interval * 0.8));
    // "easy" — bump the interval a bit.
    if (grade === "easy") interval = Math.round(interval * 1.3);
  }

  // Update ease factor (SM-2 formula), floored at 1.3.
  easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  easeFactor = Math.max(1.3, Number(easeFactor.toFixed(2)));

  const dueDate = new Date();
  dueDate.setHours(0, 0, 0, 0);
  dueDate.setDate(dueDate.getDate() + interval);

  return { easeFactor, interval, repetitions, lapses, dueDate };
}

/** Human label for the next interval, e.g. "6 days", "1 month". */
export function formatInterval(days: number): string {
  if (days <= 0) return "today";
  if (days === 1) return "1 day";
  if (days < 30) return `${days} days`;
  if (days < 365) {
    const months = Math.round(days / 30);
    return months <= 1 ? "1 month" : `${months} months`;
  }
  const years = Math.round((days / 365) * 10) / 10;
  return years === 1 ? "1 year" : `${years} years`;
}
