import { prisma } from "@/lib/prisma";

export type PhaseLessonView = {
  id: string;
  slug: string;
  title: string;
  estimatedMinutes: number;
  completed: boolean;
};

export type PhaseView = {
  id: string;
  title: string;
  phaseLevel: string | null;
  order: number;
  locked: boolean;
  contentGenerated: boolean;
  chapters: { id: string; title: string; lessons: PhaseLessonView[] }[];
  lessonsTotal: number;
  lessonsCompleted: number;
  allComplete: boolean;
  checkpoint: {
    id: string;
    passed: boolean;
    bestScore: number;
    threshold: number;
    generated: boolean;
    attempts: number;
    available: boolean; // unlocked + generated + all lessons complete
  } | null;
};

/** Full adaptive-course view: ordered phases with lock/checkpoint/progress state. */
export async function getAdaptiveCourse(slug: string, profileId: string | null) {
  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          checkpoint: true,
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

  const completed = profileId
    ? new Set(
        (
          await prisma.progress.findMany({
            where: {
              profileId,
              completed: true,
              lesson: { chapter: { module: { courseId: course.id } } },
            },
            select: { lessonId: true },
          })
        ).map((p) => p.lessonId),
      )
    : new Set<string>();

  const phases: PhaseView[] = course.modules.map((m) => {
    const chapters = m.chapters.map((c) => ({
      id: c.id,
      title: c.title,
      lessons: c.lessons.map((l) => ({ ...l, completed: completed.has(l.id) })),
    }));
    const lessons = chapters.flatMap((c) => c.lessons);
    const lessonsCompleted = lessons.filter((l) => l.completed).length;
    const allComplete = lessons.length > 0 && lessonsCompleted === lessons.length;
    const cp = m.checkpoint;

    return {
      id: m.id,
      title: m.title,
      phaseLevel: m.phaseLevel,
      order: m.order,
      locked: m.locked,
      contentGenerated: m.contentGenerated,
      chapters,
      lessonsTotal: lessons.length,
      lessonsCompleted,
      allComplete,
      checkpoint: cp
        ? {
            id: cp.id,
            passed: cp.passed,
            bestScore: cp.bestScore,
            threshold: cp.passThreshold,
            generated: cp.generated,
            attempts: cp.attempts,
            available: !m.locked && m.contentGenerated && allComplete,
          }
        : null,
    };
  });

  return { course, phases };
}

export type CheckpointQuizQuestion = {
  id: string;
  text: string;
  options: string[];
  topic: string;
  difficulty: string;
};

/** Checkpoint questions with answers stripped, for the mocktest UI. */
export async function getCheckpointQuiz(moduleId: string, profileId: string | null) {
  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { course: true, checkpoint: { include: { questions: true } } },
  });
  if (!mod || !mod.checkpoint || !mod.phaseLevel) return null;
  if (mod.course.ownerId !== profileId) return null;

  return {
    moduleId: mod.id,
    courseSlug: mod.course.slug,
    phaseTitle: mod.title,
    threshold: mod.checkpoint.passThreshold,
    generated: mod.checkpoint.generated && mod.checkpoint.questions.length > 0,
    passed: mod.checkpoint.passed,
    bestScore: mod.checkpoint.bestScore,
    questions: mod.checkpoint.questions.map((q) => ({
      id: q.id,
      text: q.text,
      options: q.options as string[],
      topic: q.topic,
      difficulty: q.difficulty,
    })),
  };
}
