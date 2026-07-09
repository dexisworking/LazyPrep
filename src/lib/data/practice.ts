import { prisma } from "@/lib/prisma";
import { courseVisibility } from "@/lib/data/courses";

export type QuizQuestion = {
  id: string;
  text: string;
  options: string[];
  topic: string;
  difficulty: string;
};

export type WrongAnswer = {
  id: string;
  text: string;
  options: string[];
  topic: string;
  difficulty: string;
  correctIdx: number;
  explanation: string;
  selectedIdx: number;
};

/** Published courses with the profile's practice stats for each. */
export async function getPracticeOverview(profileId: string | null) {
  const courses = await prisma.course.findMany({
    where: courseVisibility(profileId),
    orderBy: { createdAt: "asc" },
  });

  return Promise.all(
    courses.map(async (course) => {
      const totalQuestions = await prisma.question.count({
        where: { courseId: course.id },
      });

      let attempts = 0;
      let correct = 0;
      let answered = 0;
      let wrong = 0;

      if (profileId) {
        attempts = await prisma.questionAttempt.count({
          where: { profileId, question: { courseId: course.id } },
        });
        correct = await prisma.questionAttempt.count({
          where: { profileId, correct: true, question: { courseId: course.id } },
        });
        answered = (
          await prisma.questionAttempt.findMany({
            where: { profileId, question: { courseId: course.id } },
            distinct: ["questionId"],
            select: { questionId: true },
          })
        ).length;
        wrong = (await getWrongAnswers(course.slug, profileId)).length;
      }

      return {
        ...course,
        totalQuestions,
        attempts,
        correct,
        answered,
        wrong,
        accuracy: attempts > 0 ? Math.round((correct / attempts) * 100) : 0,
      };
    }),
  );
}

/**
 * A quiz set for a course — answers stripped out. Ordered to surface
 * never-answered questions first, then the rest, and shuffled within groups.
 */
export async function getQuizQuestions(
  courseSlug: string,
  profileId: string | null,
  limit = 10,
): Promise<QuizQuestion[]> {
  const course = await prisma.course.findUnique({ where: { slug: courseSlug } });
  if (!course) return [];

  const questions = await prisma.question.findMany({
    where: { courseId: course.id },
    select: { id: true, text: true, options: true, topic: true, difficulty: true },
  });

  const answeredIds = profileId
    ? new Set(
        (
          await prisma.questionAttempt.findMany({
            where: { profileId, question: { courseId: course.id } },
            distinct: ["questionId"],
            select: { questionId: true },
          })
        ).map((a) => a.questionId),
      )
    : new Set<string>();

  const shuffle = <T>(arr: T[]) => arr.sort(() => Math.random() - 0.5);
  const unseen = shuffle(questions.filter((q) => !answeredIds.has(q.id)));
  const seen = shuffle(questions.filter((q) => answeredIds.has(q.id)));

  return [...unseen, ...seen].slice(0, limit).map((q) => ({
    id: q.id,
    text: q.text,
    options: q.options as string[],
    topic: q.topic,
    difficulty: q.difficulty,
  }));
}

/** Questions whose most recent attempt by this profile was incorrect. */
export async function getWrongAnswers(
  courseSlug: string,
  profileId: string | null,
): Promise<WrongAnswer[]> {
  if (!profileId) return [];
  const course = await prisma.course.findUnique({ where: { slug: courseSlug } });
  if (!course) return [];

  const attempts = await prisma.questionAttempt.findMany({
    where: { profileId, question: { courseId: course.id } },
    orderBy: { createdAt: "desc" },
    select: { questionId: true, correct: true, selectedIdx: true },
  });

  // Keep only the latest attempt per question.
  const latest = new Map<string, { correct: boolean; selectedIdx: number }>();
  for (const a of attempts) {
    if (!latest.has(a.questionId)) {
      latest.set(a.questionId, { correct: a.correct, selectedIdx: a.selectedIdx });
    }
  }

  const wrongIds = [...latest.entries()]
    .filter(([, v]) => !v.correct)
    .map(([id]) => id);
  if (wrongIds.length === 0) return [];

  const questions = await prisma.question.findMany({ where: { id: { in: wrongIds } } });
  return questions.map((q) => ({
    id: q.id,
    text: q.text,
    options: q.options as string[],
    topic: q.topic,
    difficulty: q.difficulty,
    correctIdx: q.correctIdx,
    explanation: q.explanation,
    selectedIdx: latest.get(q.id)!.selectedIdx,
  }));
}
