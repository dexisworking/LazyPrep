"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/session";
import { XP_REWARDS } from "@/lib/xp";
import { buildActivityUpdates } from "@/lib/study-activity";
import { scheduleNext, INITIAL_SRS } from "@/lib/srs";

/**
 * Grade and record a single MCQ answer. Correctness is computed server-side
 * from the stored question (the client never receives correctIdx up front), so
 * XP can't be gamed. Awards XP, advances streak, logs to today's session, and
 * schedules the question for spaced-repetition review (SM-2).
 * Returns the grading so the client can show immediate feedback.
 */
export async function submitAnswer(questionId: string, selectedIdx: number) {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("Not authenticated");

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { course: { select: { ownerId: true } } },
  });
  if (!question) throw new Error("Question not found");
  if (question.course.ownerId && question.course.ownerId !== profile.id) {
    throw new Error("Not allowed");
  }

  const now = new Date();
  const correct = selectedIdx === question.correctIdx;

  const [priorAttempt, review] = await Promise.all([
    prisma.questionAttempt.findFirst({
      where: { profileId: profile.id, questionId },
      select: { id: true },
    }),
    prisma.questionReview.findUnique({
      where: { profileId_questionId: { profileId: profile.id, questionId } },
    }),
  ]);

  // XP integrity: award on the FIRST-ever attempt, or on a legitimate DUE review.
  // Repeats that aren't due earn 0 (recorded for accuracy/heatmap, but no XP), so
  // re-answering can't be used to farm XP. Mirrors reviewCard's due-only rule.
  const isFirst = !priorAttempt;
  const isDueReview = Boolean(review && review.dueDate <= now);
  const earnsXp = isFirst || isDueReview;
  const baseXp = earnsXp ? (correct ? XP_REWARDS.MCQ_CORRECT : XP_REWARDS.MCQ_INCORRECT) : 0;

  // Schedule the next review with SM-2. Correct → "good", incorrect → "again".
  const next = scheduleNext(
    review
      ? {
          easeFactor: review.easeFactor,
          interval: review.interval,
          repetitions: review.repetitions,
          lapses: review.lapses,
        }
      : INITIAL_SRS,
    correct ? "good" : "again",
  );

  const updates = buildActivityUpdates(profile, {
    xp: baseXp,
    questionsAnswered: 1,
    correctAnswers: correct ? 1 : 0,
  });

  await prisma.$transaction([
    prisma.questionAttempt.create({
      data: { profileId: profile.id, questionId, selectedIdx, correct },
    }),
    prisma.questionReview.upsert({
      where: { profileId_questionId: { profileId: profile.id, questionId } },
      update: {
        easeFactor: next.easeFactor,
        interval: next.interval,
        repetitions: next.repetitions,
        lapses: next.lapses,
        dueDate: next.dueDate,
        lastReviewedAt: now,
      },
      create: {
        profileId: profile.id,
        questionId,
        easeFactor: next.easeFactor,
        interval: next.interval,
        repetitions: next.repetitions,
        lapses: next.lapses,
        dueDate: next.dueDate,
      },
    }),
    prisma.profile.update(updates.profileUpdate),
    prisma.studySession.upsert(updates.sessionUpsert),
  ]);

  revalidatePath("/dashboard");
  revalidatePath("/practice");

  return {
    correct,
    correctIdx: question.correctIdx,
    explanation: question.explanation,
    xpAwarded: updates.xpAwarded,
  };
}
