import type { Profile } from "@prisma/client";
import { getLevelFromXp, getStreakMultiplier } from "@/lib/xp";
import { calculateStreak } from "@/lib/streak";
import { dayDate, DEFAULT_TZ } from "@/lib/day";

export type ActivityDeltas = {
  /** BASE xp for the activity; the streak multiplier is applied here, once. */
  xp: number;
  lessonsCompleted?: number;
  questionsAnswered?: number;
  correctAnswers?: number;
  flashcardsReviewed?: number;
};

/**
 * Given a profile and the activity that just happened, builds the Prisma
 * update args for the profile (XP/level/streak) and today's study session.
 * Shared by all study actions (lessons, MCQs, flashcards, checkpoints) so XP +
 * streak + heatmap accounting stay consistent. The caller composes these into a
 * single $transaction alongside its own domain write.
 *
 * The streak XP multiplier is applied here (once, from the base `deltas.xp`) so
 * every activity type gets the bonus uniformly. `xpAwarded` is the actual amount
 * granted — use it for the UI response. Day boundaries use the profile's tz.
 */
export function buildActivityUpdates(profile: Profile, deltas: ActivityDeltas) {
  const now = new Date();
  const tz = profile.timezone || DEFAULT_TZ;
  const today = dayDate(now, tz);

  const multiplier = getStreakMultiplier(profile.currentStreak);
  const xpAwarded = Math.round(deltas.xp * multiplier);

  const newXp = profile.xp + xpAwarded;
  const newLevel = getLevelFromXp(newXp);
  const { newStreak, newLongestStreak } = calculateStreak(
    profile.lastStudyDate,
    profile.currentStreak,
    profile.longestStreak,
    tz,
  );

  const zero = {
    lessonsCompleted: deltas.lessonsCompleted ?? 0,
    questionsAnswered: deltas.questionsAnswered ?? 0,
    correctAnswers: deltas.correctAnswers ?? 0,
    flashcardsReviewed: deltas.flashcardsReviewed ?? 0,
  };

  const profileUpdate = {
    where: { id: profile.id },
    data: {
      xp: newXp,
      level: newLevel,
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      lastStudyDate: now,
    },
  };

  const sessionUpsert = {
    where: { profileId_date: { profileId: profile.id, date: today } },
    update: {
      xpEarned: { increment: xpAwarded },
      lessonsCompleted: { increment: zero.lessonsCompleted },
      questionsAnswered: { increment: zero.questionsAnswered },
      correctAnswers: { increment: zero.correctAnswers },
      flashcardsReviewed: { increment: zero.flashcardsReviewed },
    },
    create: {
      profileId: profile.id,
      date: today,
      xpEarned: xpAwarded,
      ...zero,
    },
  };

  return { profileUpdate, sessionUpsert, xpAwarded, newXp, newLevel, newStreak };
}
