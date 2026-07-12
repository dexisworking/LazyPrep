"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/session";
import { guardAiRateLimit } from "@/lib/rate-limit";
import { getAiConfig } from "@/lib/ai/keys";
import { generateCheckpointQuestions } from "@/lib/ai/generate";
import { AiError } from "@/lib/ai/client";
import { XP_REWARDS } from "@/lib/xp";
import { buildActivityUpdates } from "@/lib/study-activity";
import type { Questionnaire } from "@/lib/ai/types";

function aiError(e: unknown): string {
  return e instanceof AiError ? e.message : "Generation failed. Try again.";
}

function subjectOf(course: { title: string; category: string; aiContext: unknown }): string {
  const q = course.aiContext as unknown as Questionnaire | null;
  return q?.subject ?? course.title;
}

/** Generate the checkpoint mocktest questions for a phase (idempotent). */
export async function startCheckpoint(moduleId: string) {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false as const, error: "Not authenticated." };

  const config = await getAiConfig(profile.id);
  if (!config) return { ok: false as const, error: "no-key" };

  const limited = await guardAiRateLimit(profile.id, "content");
  if (limited) return { ok: false as const, error: limited };

  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      course: true,
      checkpoint: { include: { questions: true } },
      chapters: { include: { lessons: { select: { title: true } } } },
    },
  });
  if (!mod || !mod.checkpoint || !mod.phaseLevel) {
    return { ok: false as const, error: "Checkpoint not found." };
  }
  if (mod.course.ownerId !== profile.id) return { ok: false as const, error: "Not allowed." };
  if (mod.checkpoint.generated && mod.checkpoint.questions.length > 0) {
    return { ok: true as const };
  }

  const lessonTitles = mod.chapters.flatMap((c) => c.lessons.map((l) => l.title));
  if (lessonTitles.length === 0) return { ok: false as const, error: "No lessons to test yet." };

  try {
    const qs = await generateCheckpointQuestions(config, {
      subject: subjectOf(mod.course),
      phaseLabel: mod.phaseLevel,
      lessonTitles,
    });
    const checkpointId = mod.checkpoint.id;
    await prisma.$transaction([
      prisma.checkpointQuestion.deleteMany({ where: { checkpointId } }),
      ...qs.slice(0, 12).map((x) =>
        prisma.checkpointQuestion.create({
          data: {
            checkpointId,
            topic: x.topic,
            difficulty: x.difficulty,
            text: x.text,
            options: x.options as unknown as Prisma.InputJsonValue,
            correctIdx: x.correctIdx,
            explanation: x.explanation,
          },
        }),
      ),
      prisma.checkpoint.update({ where: { id: checkpointId }, data: { generated: true } }),
    ]);
  } catch (e) {
    return { ok: false as const, error: aiError(e) };
  }

  revalidatePath(`/courses/${mod.course.slug}`);
  return { ok: true as const };
}

/** Grade a checkpoint attempt; on pass, unlock the next phase. */
export async function submitCheckpoint(
  moduleId: string,
  answers: { questionId: string; selectedIdx: number }[],
) {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false as const, error: "Not authenticated." };

  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { course: true, checkpoint: { include: { questions: true } } },
  });
  if (!mod || !mod.checkpoint) return { ok: false as const, error: "Checkpoint not found." };
  if (mod.course.ownerId !== profile.id) return { ok: false as const, error: "Not allowed." };

  const questions = mod.checkpoint.questions;
  if (questions.length === 0) return { ok: false as const, error: "No checkpoint questions." };

  let correct = 0;
  const wrongTopics: string[] = [];
  const results = questions.map((q) => {
    const a = answers.find((x) => x.questionId === q.id);
    const selectedIdx = a?.selectedIdx ?? -1;
    const isCorrect = selectedIdx === q.correctIdx;
    if (isCorrect) correct++;
    else wrongTopics.push(q.topic);
    return {
      questionId: q.id,
      selectedIdx,
      correct: isCorrect,
      correctIdx: q.correctIdx,
      explanation: q.explanation,
    };
  });

  const score = Math.round((correct / questions.length) * 100);
  const passed = score >= mod.checkpoint.passThreshold;

  const updates = buildActivityUpdates(profile, {
    xp: XP_REWARDS.PRACTICE_TEST,
    questionsAnswered: questions.length,
    correctAnswers: correct,
  });

  await prisma.$transaction([
    prisma.checkpoint.update({
      where: { id: mod.checkpoint.id },
      data: {
        attempts: { increment: 1 },
        bestScore: Math.max(mod.checkpoint.bestScore, score),
        passed: mod.checkpoint.passed || passed,
        weakTopics: Array.from(new Set(wrongTopics)).slice(0, 20),
      },
    }),
    prisma.profile.update(updates.profileUpdate),
    prisma.studySession.upsert(updates.sessionUpsert),
  ]);

  const nextModule = await prisma.module.findFirst({
    where: { courseId: mod.courseId, order: mod.order + 1 },
    select: { id: true, locked: true },
  });

  let unlockedNext = false;
  if (passed && nextModule) {
    if (nextModule.locked) {
      await prisma.module.update({ where: { id: nextModule.id }, data: { locked: false } });
    }
    unlockedNext = true;
  }

  revalidatePath(`/courses/${mod.course.slug}`);
  revalidatePath("/dashboard");
  return {
    ok: true as const,
    score,
    passed,
    threshold: mod.checkpoint.passThreshold,
    correct,
    total: questions.length,
    results,
    unlockedNext,
    hasNextPhase: Boolean(nextModule),
  };
}
