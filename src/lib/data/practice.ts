import { prisma } from "@/lib/prisma";
import { courseVisibility } from "@/lib/data/courses";
import { shuffle } from "@/lib/utils";

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
  const ids = courses.map((c) => c.id);

  // Total questions per course — one grouped query.
  const questionCounts =
    ids.length > 0
      ? await prisma.question.groupBy({
          by: ["courseId"],
          where: { courseId: { in: ids } },
          _count: { _all: true },
        })
      : [];
  const totalByCourse = new Map(questionCounts.map((g) => [g.courseId, g._count._all]));

  // Per-course attempt stats for this profile, aggregated in JS from one query
  // (avoids 4 round-trips per course).
  type Stat = {
    attempts: number;
    correct: number;
    answered: Set<string>;
    latestCorrect: Map<string, boolean>;
  };
  const stats = new Map<string, Stat>();
  const dueByCourse = new Map<string, number>();
  if (profileId && ids.length > 0) {
    const now = new Date();
    const [attempts, dueReviews] = await Promise.all([
      prisma.questionAttempt.findMany({
        where: { profileId, question: { courseId: { in: ids } } },
        orderBy: { createdAt: "desc" },
        select: { correct: true, questionId: true, question: { select: { courseId: true } } },
      }),
      // Questions due for spaced-repetition review, tallied per course.
      prisma.questionReview.findMany({
        where: { profileId, dueDate: { lte: now }, question: { courseId: { in: ids } } },
        select: { question: { select: { courseId: true } } },
      }),
    ]);
    for (const a of attempts) {
      const cid = a.question.courseId;
      let s = stats.get(cid);
      if (!s) {
        s = { attempts: 0, correct: 0, answered: new Set(), latestCorrect: new Map() };
        stats.set(cid, s);
      }
      s.attempts++;
      if (a.correct) s.correct++;
      s.answered.add(a.questionId);
      // desc order → the first row seen per question is its latest attempt.
      if (!s.latestCorrect.has(a.questionId)) s.latestCorrect.set(a.questionId, a.correct);
    }
    for (const r of dueReviews) {
      const cid = r.question.courseId;
      dueByCourse.set(cid, (dueByCourse.get(cid) ?? 0) + 1);
    }
  }

  return courses.map((course) => {
    const s = stats.get(course.id);
    const attempts = s?.attempts ?? 0;
    const correct = s?.correct ?? 0;
    const answered = s?.answered.size ?? 0;
    const wrong = s ? [...s.latestCorrect.values()].filter((c) => !c).length : 0;
    return {
      ...course,
      totalQuestions: totalByCourse.get(course.id) ?? 0,
      attempts,
      correct,
      answered,
      wrong,
      dueReviews: dueByCourse.get(course.id) ?? 0,
      accuracy: attempts > 0 ? Math.round((correct / attempts) * 100) : 0,
    };
  });
}

/**
 * Questions due for spaced-repetition review in a course (dueDate ≤ now),
 * oldest-due first. Answers stripped — the review session grades server-side.
 * Mirrors getStudyCards for flashcards.
 */
export async function getReviewQuestions(
  courseSlug: string,
  profileId: string | null,
  limit = 15,
): Promise<QuizQuestion[]> {
  if (!profileId) return [];
  const course = await prisma.course.findUnique({ where: { slug: courseSlug } });
  if (!course) return [];

  const due = await prisma.questionReview.findMany({
    where: { profileId, dueDate: { lte: new Date() }, question: { courseId: course.id } },
    orderBy: { dueDate: "asc" },
    take: limit,
    include: {
      question: { select: { id: true, text: true, options: true, topic: true, difficulty: true } },
    },
  });

  return due.map((r) => ({
    id: r.question.id,
    text: r.question.text,
    options: r.question.options as string[],
    topic: r.question.topic,
    difficulty: r.question.difficulty,
  }));
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
