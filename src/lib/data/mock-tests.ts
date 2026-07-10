import { prisma } from "@/lib/prisma";

export type MockTestSummary = {
  id: string;
  title: string;
  difficulty: string;
  durationMinutes: number;
  questionCount: number;
  attemptCount: number;
  bestScore: number | null;
  lastScore: number | null;
  lastAttemptId: string | null;
  createdAt: Date;
};

/** This user's mock tests for a course, newest first, with attempt stats. */
export async function getMockTests(
  courseId: string,
  profileId: string,
): Promise<MockTestSummary[]> {
  const tests = await prisma.mockTest.findMany({
    where: { courseId, profileId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { questions: true } },
      attempts: {
        where: { completedAt: { not: null } },
        orderBy: { startedAt: "desc" },
        select: { id: true, score: true },
      },
    },
  });

  return tests.map((t) => ({
    id: t.id,
    title: t.title,
    difficulty: t.difficulty,
    durationMinutes: t.durationMinutes,
    questionCount: t._count.questions,
    attemptCount: t.attempts.length,
    bestScore: t.attempts.length ? Math.max(...t.attempts.map((a) => a.score)) : null,
    lastScore: t.attempts[0]?.score ?? null,
    lastAttemptId: t.attempts[0]?.id ?? null,
    createdAt: t.createdAt,
  }));
}

export type TakingQuestion = {
  id: string;
  order: number;
  text: string;
  options: string[];
  topic: string;
  difficulty: string;
};

/** A mock test ready to take — answers stripped. Owner-only. */
export async function getMockTestForTaking(testId: string, profileId: string) {
  const test = await prisma.mockTest.findUnique({
    where: { id: testId },
    include: {
      course: { select: { slug: true, title: true } },
      questions: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          order: true,
          text: true,
          options: true,
          topic: true,
          difficulty: true,
        },
      },
    },
  });
  if (!test || test.profileId !== profileId) return null;

  return {
    id: test.id,
    title: test.title,
    difficulty: test.difficulty,
    durationMinutes: test.durationMinutes,
    courseSlug: test.course.slug,
    courseTitle: test.course.title,
    questions: test.questions.map(
      (q): TakingQuestion => ({
        id: q.id,
        order: q.order,
        text: q.text,
        options: q.options as string[],
        topic: q.topic,
        difficulty: q.difficulty,
      }),
    ),
  };
}

/** A completed attempt with full grading detail, for the review page. Owner-only. */
export async function getMockTestAttemptReview(attemptId: string, profileId: string) {
  const attempt = await prisma.mockTestAttempt.findUnique({
    where: { id: attemptId },
    include: {
      test: {
        include: {
          course: { select: { slug: true, title: true } },
          questions: { orderBy: { order: "asc" } },
        },
      },
    },
  });
  if (!attempt || attempt.test.profileId !== profileId) return null;

  const answers = (attempt.answers as (number | null)[]) ?? [];
  const byTopic = new Map<string, { correct: number; total: number }>();
  const questions = attempt.test.questions.map((q, i) => {
    const selected = typeof answers[i] === "number" ? answers[i] : null;
    const isCorrect = selected === q.correctIdx;
    const t = byTopic.get(q.topic) ?? { correct: 0, total: 0 };
    t.total++;
    if (isCorrect) t.correct++;
    byTopic.set(q.topic, t);
    return {
      order: q.order,
      text: q.text,
      options: q.options as string[],
      topic: q.topic,
      difficulty: q.difficulty,
      correctIdx: q.correctIdx,
      explanation: q.explanation,
      selectedIdx: selected,
    };
  });

  return {
    testTitle: attempt.test.title,
    courseSlug: attempt.test.course.slug,
    courseTitle: attempt.test.course.title,
    completedAt: attempt.completedAt,
    score: attempt.score,
    correct: attempt.correct,
    total: attempt.total,
    topics: [...byTopic.entries()].map(([topic, t]) => ({ topic, ...t })),
    questions,
  };
}
