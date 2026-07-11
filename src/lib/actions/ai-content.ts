"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/session";
import { getAiConfig } from "@/lib/ai/keys";
import { canAccessCourse } from "@/lib/data/courses";
import {
  generateFlashcardsAi,
  generateMockTestQuestions,
  generatePracticeQuestions,
} from "@/lib/ai/generate";
import { AiError } from "@/lib/ai/client";
import { XP_REWARDS } from "@/lib/xp";
import { buildActivityUpdates } from "@/lib/study-activity";

function aiErrorMessage(e: unknown): string {
  return e instanceof AiError ? e.message : "Generation failed. Try again.";
}

/** All lesson titles of a course, in course order (context for generation). */
async function courseLessonTitles(courseId: string): Promise<string[]> {
  const modules = await prisma.module.findMany({
    where: { courseId },
    orderBy: { order: "asc" },
    select: {
      chapters: {
        orderBy: { order: "asc" },
        select: {
          lessons: { orderBy: { order: "asc" }, select: { title: true } },
        },
      },
    },
  });
  return modules.flatMap((m) => m.chapters.flatMap((c) => c.lessons.map((l) => l.title)));
}

// ─── Flashcards ───

/**
 * Generate extra flashcards for a course with the user's BYO AI key. The new
 * cards are PRIVATE to the generating user (ownerId set) — curated decks stay
 * shared — and flow straight into their SRS queue as new cards.
 */
export async function generateFlashcards(
  courseId: string,
  opts: { topic?: string; count: number },
) {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false as const, error: "Not authenticated." };

  const config = await getAiConfig(profile.id);
  if (!config) return { ok: false as const, error: "no-key" };

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || !canAccessCourse(course, profile.id)) {
    return { ok: false as const, error: "Course not found." };
  }

  const [lessonTitles, existing] = await Promise.all([
    courseLessonTitles(course.id),
    prisma.flashcard.findMany({
      where: {
        courseId: course.id,
        OR: [{ ownerId: null }, { ownerId: profile.id }],
      },
      select: { front: true },
      take: 120,
    }),
  ]);

  let cards;
  try {
    cards = await generateFlashcardsAi(config, {
      courseTitle: course.title,
      lessonTitles,
      topic: opts.topic,
      count: opts.count,
      existingFronts: existing.map((f) => f.front),
    });
  } catch (e) {
    return { ok: false as const, error: aiErrorMessage(e) };
  }

  await prisma.flashcard.createMany({
    data: cards.map((c) => ({
      courseId: course.id,
      front: c.front,
      back: c.back,
      topic: c.topic,
      tags: [],
      ownerId: profile.id,
      aiGenerated: true,
    })),
  });

  revalidatePath("/flashcards");
  revalidatePath(`/flashcards/${course.slug}`);
  return { ok: true as const, added: cards.length };
}

// ─── Lazy first-visit population (AI courses only) ───
//
// Curated packs ship a practice bank + flashcard deck. AI courses start with
// neither, so the first time their owner opens the Practice / Flashcards tab we
// auto-generate a starter set. Both actions are idempotent: they bail if the
// content already exists, so a revisit never re-spends the user's AI credits.

const STARTER_QUESTION_COUNT = 18;
const STARTER_CARD_COUNT = 18;

/** Generate a starter practice-question bank for an AI course, once. */
export async function ensurePracticeBank(courseId: string) {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false as const, error: "Not authenticated." };

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || !canAccessCourse(course, profile.id)) {
    return { ok: false as const, error: "Course not found." };
  }
  // Only auto-populate AI courses owned by this user.
  if (!course.aiGenerated || course.ownerId !== profile.id) {
    return { ok: false as const, error: "Not allowed." };
  }
  // Idempotent: already has a bank → no-op (no API call).
  const existing = await prisma.question.count({ where: { courseId: course.id } });
  if (existing > 0) return { ok: true as const, added: 0 };

  const config = await getAiConfig(profile.id);
  if (!config) return { ok: false as const, error: "no-key" };

  const lessonTitles = await courseLessonTitles(course.id);
  if (lessonTitles.length === 0) {
    return { ok: false as const, error: "This course has no lessons yet." };
  }

  let questions;
  try {
    questions = await generatePracticeQuestions(config, {
      courseTitle: course.title,
      lessonTitles,
      count: STARTER_QUESTION_COUNT,
    });
  } catch (e) {
    return { ok: false as const, error: aiErrorMessage(e) };
  }

  // Guard against a race: re-check before inserting.
  const stillEmpty = (await prisma.question.count({ where: { courseId: course.id } })) === 0;
  if (!stillEmpty) return { ok: true as const, added: 0 };

  await prisma.question.createMany({
    data: questions.map((q) => ({
      courseId: course.id,
      topic: (q.topic || "General").slice(0, 80),
      difficulty: q.difficulty || "medium",
      text: q.text,
      options: q.options,
      correctIdx: q.correctIdx,
      explanation: q.explanation ?? "",
      tags: [],
    })),
  });

  revalidatePath("/practice");
  revalidatePath(`/practice/${course.slug}`);
  return { ok: true as const, added: questions.length };
}

/** Generate a starter flashcard deck for an AI course, once. */
export async function ensureFlashcardDeck(courseId: string) {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false as const, error: "Not authenticated." };

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || !canAccessCourse(course, profile.id)) {
    return { ok: false as const, error: "Course not found." };
  }
  if (!course.aiGenerated || course.ownerId !== profile.id) {
    return { ok: false as const, error: "Not allowed." };
  }
  // Idempotent: user already has cards for this course (curated or their own) → no-op.
  const existing = await prisma.flashcard.count({
    where: { courseId: course.id, OR: [{ ownerId: null }, { ownerId: profile.id }] },
  });
  if (existing > 0) return { ok: true as const, added: 0 };

  // Delegate to the shared generator (handles key check, ownership, SRS entry).
  return generateFlashcards(courseId, { count: STARTER_CARD_COUNT });
}

// ─── Mock tests ───

/**
 * Generate a new timed mock test for a course with the user's BYO AI key.
 * The test (and its questions) belong to this user only.
 */
export async function createMockTest(
  courseId: string,
  opts: { count: number; difficulty: "mixed" | "easy" | "medium" | "hard" },
) {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false as const, error: "Not authenticated." };

  const config = await getAiConfig(profile.id);
  if (!config) return { ok: false as const, error: "no-key" };

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || !canAccessCourse(course, profile.id)) {
    return { ok: false as const, error: "Course not found." };
  }

  const count = Math.min(Math.max(opts.count, 5), 40);
  const lessonTitles = await courseLessonTitles(course.id);
  if (lessonTitles.length === 0) {
    return { ok: false as const, error: "This course has no lessons to test yet." };
  }

  let questions;
  try {
    questions = await generateMockTestQuestions(config, {
      courseTitle: course.title,
      lessonTitles,
      count,
      difficulty: opts.difficulty,
    });
  } catch (e) {
    return { ok: false as const, error: aiErrorMessage(e) };
  }

  const testNumber =
    (await prisma.mockTest.count({
      where: { profileId: profile.id, courseId: course.id },
    })) + 1;

  // ~72 seconds per question, like the real exam pace.
  const durationMinutes = Math.max(5, Math.round((questions.length * 72) / 60));

  const test = await prisma.mockTest.create({
    data: {
      profileId: profile.id,
      courseId: course.id,
      title: `Mock Test ${testNumber}`,
      difficulty: opts.difficulty,
      durationMinutes,
      questions: {
        create: questions.map((q, i) => ({
          order: i + 1,
          topic: (q.topic || "General").slice(0, 80),
          difficulty: q.difficulty || "medium",
          text: q.text,
          options: q.options,
          correctIdx: q.correctIdx,
          explanation: q.explanation ?? "",
        })),
      },
    },
  });

  revalidatePath(`/practice/${course.slug}/mocks`);
  return { ok: true as const, testId: test.id };
}

export type MockTestReview = {
  score: number;
  correct: number;
  total: number;
  xpAwarded: number;
  attemptId: string;
  topics: { topic: string; correct: number; total: number }[];
  questions: {
    order: number;
    text: string;
    options: string[];
    topic: string;
    difficulty: string;
    correctIdx: number;
    explanation: string;
    selectedIdx: number | null;
  }[];
};

/**
 * Grade a finished mock test server-side (the client never sees correctIdx
 * while the clock runs), store the attempt, and award XP on the FIRST attempt
 * only — retakes are recorded but XP-free, so they can't farm XP.
 */
export async function submitMockTest(
  testId: string,
  answers: (number | null)[],
): Promise<{ ok: true; review: MockTestReview } | { ok: false; error: string }> {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: "Not authenticated." };

  const test = await prisma.mockTest.findUnique({
    where: { id: testId },
    include: {
      questions: { orderBy: { order: "asc" } },
      course: { select: { slug: true } },
      _count: { select: { attempts: true } },
    },
  });
  if (!test || test.profileId !== profile.id) {
    return { ok: false, error: "Test not found." };
  }

  const total = test.questions.length;
  let correct = 0;
  const byTopic = new Map<string, { correct: number; total: number }>();
  const questions = test.questions.map((q, i) => {
    const selected = typeof answers[i] === "number" ? answers[i] : null;
    const isCorrect = selected === q.correctIdx;
    if (isCorrect) correct++;
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

  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  const firstAttempt = test._count.attempts === 0;
  const baseXp = firstAttempt
    ? XP_REWARDS.PRACTICE_TEST + correct * XP_REWARDS.MOCK_CORRECT
    : 0;
  const updates = buildActivityUpdates(profile, {
    xp: baseXp,
    questionsAnswered: total,
    correctAnswers: correct,
  });

  const [attempt] = await prisma.$transaction([
    prisma.mockTestAttempt.create({
      data: {
        testId: test.id,
        completedAt: new Date(),
        score,
        correct,
        total,
        answers: answers.map((a) => (typeof a === "number" ? a : null)),
      },
    }),
    prisma.profile.update(updates.profileUpdate),
    prisma.studySession.upsert(updates.sessionUpsert),
  ]);

  revalidatePath("/dashboard");
  revalidatePath(`/practice/${test.course.slug}/mocks`);

  return {
    ok: true,
    review: {
      score,
      correct,
      total,
      xpAwarded: updates.xpAwarded,
      attemptId: attempt.id,
      topics: [...byTopic.entries()].map(([topic, t]) => ({ topic, ...t })),
      questions,
    },
  };
}

/** Delete one of your own mock tests (attempts cascade). */
export async function deleteMockTest(testId: string) {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false as const, error: "Not authenticated." };

  const test = await prisma.mockTest.findUnique({
    where: { id: testId },
    include: { course: { select: { slug: true } } },
  });
  if (!test || test.profileId !== profile.id) {
    return { ok: false as const, error: "Test not found." };
  }

  await prisma.mockTest.delete({ where: { id: testId } });
  revalidatePath(`/practice/${test.course.slug}/mocks`);
  return { ok: true as const };
}
