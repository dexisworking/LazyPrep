"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/session";
import { XP_REWARDS } from "@/lib/xp";
import { buildActivityUpdates } from "@/lib/study-activity";

/**
 * Grade and record a single MCQ answer. Correctness is computed server-side
 * from the stored question (the client never receives correctIdx up front), so
 * XP can't be gamed. Awards XP, advances streak, and logs to today's session.
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

  // XP is awarded only for the FIRST attempt at a question — repeats are still
  // recorded (accuracy, notebook, heatmap) and count as daily activity, but
  // earn no XP, so re-answering can't be used to farm XP.
  const priorAttempt = await prisma.questionAttempt.findFirst({
    where: { profileId: profile.id, questionId },
    select: { id: true },
  });
  const correct = selectedIdx === question.correctIdx;
  const baseXp = priorAttempt ? 0 : correct ? XP_REWARDS.MCQ_CORRECT : XP_REWARDS.MCQ_INCORRECT;
  const updates = buildActivityUpdates(profile, {
    xp: baseXp,
    questionsAnswered: 1,
    correctAnswers: correct ? 1 : 0,
  });

  await prisma.$transaction([
    prisma.questionAttempt.create({
      data: { profileId: profile.id, questionId, selectedIdx, correct },
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
