import type { Profile } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCourseTree } from "@/lib/data/courses";

/** Minimal profile shape passed to the nav chrome (sidebar/navbar/mobile nav). */
export type ProfileSummary = {
  displayName: string;
  xp: number;
  level: number;
  currentStreak: number;
};

export function toProfileSummary(profile: Profile): ProfileSummary {
  return {
    displayName: profile.displayName ?? "Explorer",
    xp: profile.xp,
    level: profile.level,
    currentStreak: profile.currentStreak,
  };
}

/** Everything the dashboard home page needs, in one call. */
export async function getDashboardData(profile: Profile) {
  const enrollment = await prisma.enrollment.findFirst({
    where: { profileId: profile.id },
    include: { course: true },
    orderBy: { enrolledAt: "desc" },
  });

  const course =
    enrollment?.course ??
    (await prisma.course.findFirst({
      where: { published: true },
      orderBy: { createdAt: "asc" },
    }));

  let courseProgress: {
    slug: string;
    title: string;
    totalLessons: number;
    completedLessons: number;
    resumeLessonSlug: string | null;
    resumeLessonTitle: string | null;
    enrolled: boolean;
  } | null = null;

  if (course) {
    const tree = await getCourseTree(course.slug, profile.id);
    if (tree) {
      courseProgress = {
        slug: course.slug,
        title: course.title,
        totalLessons: tree.totalLessons,
        completedLessons: tree.completedLessons,
        resumeLessonSlug: tree.resumeLesson?.slug ?? null,
        resumeLessonTitle: tree.resumeLesson?.title ?? null,
        enrolled: Boolean(enrollment),
      };
    }
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todaySession = await prisma.studySession.findUnique({
    where: { profileId_date: { profileId: profile.id, date: today } },
  });

  const totalAttempts = await prisma.questionAttempt.count({
    where: { profileId: profile.id },
  });
  const correctAttempts = await prisma.questionAttempt.count({
    where: { profileId: profile.id, correct: true },
  });

  return {
    courseProgress,
    todaySession,
    totalAttempts,
    correctAttempts,
    accuracy: totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0,
  };
}
