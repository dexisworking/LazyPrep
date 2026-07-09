import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Visibility filter: a user sees curated/global courses (ownerId = null) plus
 * their own generated courses — never another user's private course.
 */
export function courseVisibility(profileId: string | null): Prisma.CourseWhereInput {
  return {
    published: true,
    OR: [{ ownerId: null }, ...(profileId ? [{ ownerId: profileId }] : [])],
  };
}

/** True if the given profile may view this course. */
export function canAccessCourse(
  course: { ownerId: string | null },
  profileId: string | null,
): boolean {
  return course.ownerId === null || course.ownerId === profileId;
}

/** Courses list with per-course progress for the given profile (or null = signed out). */
export async function getCoursesOverview(profileId: string | null) {
  const courses = await prisma.course.findMany({
    where: courseVisibility(profileId),
    orderBy: { createdAt: "asc" },
  });

  return Promise.all(
    courses.map(async (course) => {
      const totalLessons = await prisma.lesson.count({
        where: { chapter: { module: { courseId: course.id } } },
      });
      const completedLessons = profileId
        ? await prisma.progress.count({
            where: {
              profileId,
              completed: true,
              lesson: { chapter: { module: { courseId: course.id } } },
            },
          })
        : 0;
      const enrolled = profileId
        ? Boolean(
            await prisma.enrollment.findUnique({
              where: { profileId_courseId: { profileId, courseId: course.id } },
            }),
          )
        : false;

      return { ...course, totalLessons, completedLessons, enrolled };
    }),
  );
}

export type OrderedLesson = {
  id: string;
  slug: string;
  title: string;
  estimatedMinutes: number;
  moduleTitle: string;
  chapterTitle: string;
  completed: boolean;
};

/**
 * Full course structure (modules → chapters → lessons) annotated with the
 * profile's completion state, plus a flattened ordered lesson list and the
 * next lesson to resume. Lesson content is NOT loaded here (fetch separately).
 */
export async function getCourseTree(slug: string, profileId: string | null) {
  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          chapters: {
            orderBy: { order: "asc" },
            include: {
              lessons: {
                orderBy: { order: "asc" },
                select: { id: true, slug: true, title: true, estimatedMinutes: true },
              },
            },
          },
        },
      },
    },
  });
  if (!course) return null;

  const completedRows = profileId
    ? await prisma.progress.findMany({
        where: {
          profileId,
          completed: true,
          lesson: { chapter: { module: { courseId: course.id } } },
        },
        select: { lessonId: true },
      })
    : [];
  const completedSet = new Set(completedRows.map((r) => r.lessonId));

  const orderedLessons: OrderedLesson[] = [];
  const modules = course.modules.map((m) => ({
    ...m,
    chapters: m.chapters.map((c) => ({
      ...c,
      lessons: c.lessons.map((l) => {
        const completed = completedSet.has(l.id);
        orderedLessons.push({
          ...l,
          moduleTitle: m.title,
          chapterTitle: c.title,
          completed,
        });
        return { ...l, completed };
      }),
    })),
  }));

  const totalLessons = orderedLessons.length;
  const completedLessons = orderedLessons.filter((l) => l.completed).length;
  const resumeLesson =
    orderedLessons.find((l) => !l.completed) ?? orderedLessons[0] ?? null;

  return {
    course,
    modules,
    orderedLessons,
    totalLessons,
    completedLessons,
    resumeLesson,
  };
}

/** A single lesson with content + prev/next neighbors + completion state. */
export async function getLessonView(
  courseSlug: string,
  lessonSlug: string,
  profileId: string | null,
) {
  const tree = await getCourseTree(courseSlug, profileId);
  if (!tree) return null;

  const idx = tree.orderedLessons.findIndex((l) => l.slug === lessonSlug);
  if (idx === -1) return null;

  const lesson = await prisma.lesson.findFirst({
    where: {
      slug: lessonSlug,
      chapter: { module: { course: { slug: courseSlug } } },
    },
  });
  if (!lesson) return null;

  const meta = tree.orderedLessons[idx];
  return {
    course: tree.course,
    lesson,
    completed: meta.completed,
    moduleTitle: meta.moduleTitle,
    chapterTitle: meta.chapterTitle,
    position: idx + 1,
    total: tree.orderedLessons.length,
    prev: idx > 0 ? tree.orderedLessons[idx - 1] : null,
    next: idx < tree.orderedLessons.length - 1 ? tree.orderedLessons[idx + 1] : null,
  };
}
