import type { Profile } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCourseTree, courseVisibility } from "@/lib/data/courses";
import { dayDate, DEFAULT_TZ } from "@/lib/day";

/** Minimal profile shape passed to the nav chrome (sidebar/navbar/mobile nav). */
export type ProfileSummary = {
  displayName: string;
  /** Google/OAuth profile picture, or null to fall back to initials. */
  avatarUrl: string | null;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  streakFreezes: number;
  lastStudyDate: Date | null;
  timezone: string;
};

/**
 * `user` carries the auth-side avatar. Better Auth stores the social provider's
 * picture on `user.image`, and nothing copies it onto `Profile` — so the shell
 * has to be handed the session user, or the sidebar can only ever show initials.
 * `Profile.avatarUrl` wins when set, for a future in-app upload.
 */
export function toProfileSummary(
  profile: Profile,
  user?: { image?: string | null } | null,
): ProfileSummary {
  return {
    displayName: profile.displayName ?? "Explorer",
    avatarUrl: profile.avatarUrl ?? user?.image ?? null,
    xp: profile.xp,
    level: profile.level,
    currentStreak: profile.currentStreak,
    longestStreak: profile.longestStreak,
    streakFreezes: profile.streakFreezes ?? 2,
    lastStudyDate: profile.lastStudyDate,
    timezone: profile.timezone ?? DEFAULT_TZ,
  };
}

/**
 * Everything the dashboard home page needs, in one call.
 *
 * `courseProgress` is populated **only** from a real enrollment. This used to
 * fall back to the oldest curated course when the user had none, which the
 * dashboard then rendered as "Continue learning" — so every new account looked
 * enrolled in a course it had never opted into. The fallback now comes back
 * separately as `suggestedCourse`, which the page presents as an invitation.
 */
export async function getDashboardData(profile: Profile) {
  const enrollment = await prisma.enrollment.findFirst({
    where: { profileId: profile.id },
    include: { course: true },
    orderBy: { enrolledAt: "desc" },
  });

  let courseProgress: {
    slug: string;
    title: string;
    totalLessons: number;
    completedLessons: number;
    resumeLessonSlug: string | null;
    resumeLessonTitle: string | null;
  } | null = null;
  let suggestedCourse: { slug: string; title: string } | null = null;

  if (enrollment) {
    const tree = await getCourseTree(enrollment.course.slug, profile.id);
    if (tree) {
      courseProgress = {
        slug: enrollment.course.slug,
        title: enrollment.course.title,
        totalLessons: tree.totalLessons,
        completedLessons: tree.completedLessons,
        resumeLessonSlug: tree.resumeLesson?.slug ?? null,
        resumeLessonTitle: tree.resumeLesson?.title ?? null,
      };
    }
  } else {
    suggestedCourse = await prisma.course.findFirst({
      where: courseVisibility(profile.id),
      orderBy: { createdAt: "asc" },
      select: { slug: true, title: true },
    });
  }

  const today = dayDate(new Date(), profile.timezone || DEFAULT_TZ);
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
    suggestedCourse,
    todaySession,
    totalAttempts,
    correctAttempts,
    accuracy: totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0,
  };
}
