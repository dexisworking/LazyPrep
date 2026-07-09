"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/session";
import { XP_REWARDS, getLevelFromXp, getStreakMultiplier } from "@/lib/xp";
import { calculateStreak } from "@/lib/streak";

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Mark a lesson complete: records progress, awards XP (with streak multiplier),
 * advances the daily streak, and logs the activity to today's study session.
 * Idempotent — re-completing an already-complete lesson awards nothing.
 */
export async function markLessonComplete(lessonId: string, coursePath?: string) {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("Not authenticated");

  const existing = await prisma.progress.findUnique({
    where: { profileId_lessonId: { profileId: profile.id, lessonId } },
  });
  if (existing?.completed) {
    return { alreadyComplete: true, xpAwarded: 0 };
  }

  const multiplier = getStreakMultiplier(profile.currentStreak);
  const xpAwarded = Math.round(XP_REWARDS.LESSON_COMPLETE * multiplier);
  const newXp = profile.xp + xpAwarded;
  const { newStreak, newLongestStreak } = calculateStreak(
    profile.lastStudyDate,
    profile.currentStreak,
    profile.longestStreak,
  );
  const now = new Date();
  const today = startOfToday();

  await prisma.$transaction([
    prisma.progress.upsert({
      where: { profileId_lessonId: { profileId: profile.id, lessonId } },
      update: { completed: true, completedAt: now, lastAccessedAt: now },
      create: { profileId: profile.id, lessonId, completed: true, completedAt: now },
    }),
    prisma.profile.update({
      where: { id: profile.id },
      data: {
        xp: newXp,
        level: getLevelFromXp(newXp),
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastStudyDate: now,
      },
    }),
    prisma.studySession.upsert({
      where: { profileId_date: { profileId: profile.id, date: today } },
      update: {
        lessonsCompleted: { increment: 1 },
        xpEarned: { increment: xpAwarded },
      },
      create: {
        profileId: profile.id,
        date: today,
        lessonsCompleted: 1,
        xpEarned: xpAwarded,
      },
    }),
  ]);

  revalidatePath("/dashboard");
  if (coursePath) revalidatePath(coursePath, "layout");

  return {
    alreadyComplete: false,
    xpAwarded,
    newStreak,
    level: getLevelFromXp(newXp),
  };
}

/**
 * Record that the user opened a lesson (for "continue where you left off").
 * Creates an incomplete progress row if none exists; otherwise bumps the
 * last-accessed timestamp. Never marks a lesson complete.
 */
export async function recordLessonView(lessonId: string) {
  const profile = await getCurrentProfile();
  if (!profile) return;

  await prisma.progress.upsert({
    where: { profileId_lessonId: { profileId: profile.id, lessonId } },
    update: { lastAccessedAt: new Date() },
    create: { profileId: profile.id, lessonId, lastAccessedAt: new Date() },
  });
}
