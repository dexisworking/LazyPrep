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

  const question = await prisma.question.findUnique({ where: { id: questionId } });
  if (!question) throw new Error("Question not found");

  const correct = selectedIdx === question.correctIdx;
  const xpAwarded = correct ? XP_REWARDS.MCQ_CORRECT : XP_REWARDS.MCQ_INCORRECT;
  const updates = buildActivityUpdates(profile, {
    xp: xpAwarded,
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
    xpAwarded,
  };
}
