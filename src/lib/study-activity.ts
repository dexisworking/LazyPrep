import type { Profile } from "@prisma/client";
import { getLevelFromXp } from "@/lib/xp";
import { calculateStreak } from "@/lib/streak";

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export type ActivityDeltas = {
  xp: number;
  lessonsCompleted?: number;
  questionsAnswered?: number;
  correctAnswers?: number;
  flashcardsReviewed?: number;
};

/**
 * Given a profile and the activity that just happened, builds the Prisma
 * update args for the profile (XP/level/streak) and today's study session.
 * Shared by all study actions (lessons, MCQs, flashcards) so XP + streak +
 * heatmap accounting stay consistent. The caller composes these into a single
 * $transaction alongside its own domain write.
 */
export function buildActivityUpdates(profile: Profile, deltas: ActivityDeltas) {
  const now = new Date();
  const today = startOfToday();
  const newXp = profile.xp + deltas.xp;
  const newLevel = getLevelFromXp(newXp);
  const { newStreak, newLongestStreak } = calculateStreak(
    profile.lastStudyDate,
    profile.currentStreak,
    profile.longestStreak,
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
      xpEarned: { increment: deltas.xp },
      lessonsCompleted: { increment: zero.lessonsCompleted },
      questionsAnswered: { increment: zero.questionsAnswered },
      correctAnswers: { increment: zero.correctAnswers },
      flashcardsReviewed: { increment: zero.flashcardsReviewed },
    },
    create: {
      profileId: profile.id,
      date: today,
      xpEarned: deltas.xp,
      ...zero,
    },
  };

  return { profileUpdate, sessionUpsert, newXp, newLevel, newStreak };
}
