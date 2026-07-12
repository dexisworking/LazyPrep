"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/session";
import { canAccessCourse } from "@/lib/data/courses";
import { XP_REWARDS } from "@/lib/xp";
import { buildActivityUpdates } from "@/lib/study-activity";

/**
 * Confirm a lesson exists and belongs to a course the profile may access
 * (curated, or their own). Prevents marking progress on arbitrary lesson IDs
 * (e.g. lessons in another user's private course) to farm XP/streak.
 */
async function assertLessonAccessible(lessonId: string, profileId: string): Promise<boolean> {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { chapter: { select: { module: { select: { course: { select: { ownerId: true } } } } } } },
  });
  if (!lesson) return false;
  return canAccessCourse(lesson.chapter.module.course, profileId);
}

/**
 * Mark a lesson complete: records progress, awards XP (with streak multiplier),
 * advances the daily streak, and logs the activity to today's study session.
 * Idempotent — re-completing an already-complete lesson awards nothing.
 */
export async function markLessonComplete(lessonId: string, coursePath?: string) {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("Not authenticated");

  if (!(await assertLessonAccessible(lessonId, profile.id))) {
    throw new Error("Lesson not found");
  }

  const existing = await prisma.progress.findUnique({
    where: { profileId_lessonId: { profileId: profile.id, lessonId } },
  });
  if (existing?.completed) {
    return { alreadyComplete: true, xpAwarded: 0 };
  }

  const now = new Date();
  const updates = buildActivityUpdates(profile, {
    xp: XP_REWARDS.LESSON_COMPLETE,
    lessonsCompleted: 1,
  });

  await prisma.$transaction([
    prisma.progress.upsert({
      where: { profileId_lessonId: { profileId: profile.id, lessonId } },
      update: { completed: true, completedAt: now, lastAccessedAt: now },
      create: { profileId: profile.id, lessonId, completed: true, completedAt: now },
    }),
    prisma.profile.update(updates.profileUpdate),
    prisma.studySession.upsert(updates.sessionUpsert),
  ]);

  revalidatePath("/dashboard");
  if (coursePath) revalidatePath(coursePath, "layout");

  return {
    alreadyComplete: false,
    xpAwarded: updates.xpAwarded,
    newStreak: updates.newStreak,
    level: updates.newLevel,
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

  if (!(await assertLessonAccessible(lessonId, profile.id))) return;

  await prisma.progress.upsert({
    where: { profileId_lessonId: { profileId: profile.id, lessonId } },
    update: { lastAccessedAt: new Date() },
    create: { profileId: profile.id, lessonId, lastAccessedAt: new Date() },
  });
}
