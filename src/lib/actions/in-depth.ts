"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/session";
import { guardAiRateLimit } from "@/lib/rate-limit";
import { getAiConfig } from "@/lib/ai/keys";
import { formatAiError } from "@/lib/ai/client";
import { generateInDepthMarkdown, finalizeInteractiveBlocks } from "@/lib/ai/generate";
import type { PhaseLevel } from "@/lib/ai/types";

const inDepthSchema = z.object({
  lessonId: z.string().min(1).max(64),
  selectedText: z.string().min(3).max(1000),
});

/**
 * Generate a deep-dive section for a selected piece of text within a lesson.
 * The new section is appended to the lesson's existing Markdown content as a
 * "## Deep Dive: ..." block, then the interactive blocks are validated.
 */
export async function generateInDepthSection(
  lessonId: string,
  selectedText: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: "Not authenticated." };

  const parsed = inDepthSchema.safeParse({ lessonId, selectedText });
  if (!parsed.success) return { ok: false, error: "Invalid input." };

  const config = await getAiConfig(profile.id);
  if (!config) return { ok: false, error: "no-key" };

  const limited = await guardAiRateLimit(profile.id, "content");
  if (limited) return { ok: false, error: limited };

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { chapter: { include: { module: { include: { course: true } } } } },
  });

  if (!lesson) return { ok: false, error: "Lesson not found." };

  const course = lesson.chapter.module.course;
  if (course.ownerId && course.ownerId !== profile.id) {
    return { ok: false, error: "Not allowed." };
  }

  if (lesson.content.trim().length === 0) {
    return { ok: false, error: "This lesson has no content yet." };
  }

  let deepDiveMd: string;
  try {
    deepDiveMd = await generateInDepthMarkdown(config, {
      courseTitle: course.title,
      lessonTitle: lesson.title,
      lessonContent: lesson.content,
      selectedText: parsed.data.selectedText,
      phaseLevel: (lesson.chapter.module.phaseLevel as PhaseLevel | null) ?? undefined,
    });
  } catch (e) {
    return { ok: false, error: formatAiError(e) };
  }

  // Validate interactive blocks in the generated section
  const validated = await finalizeInteractiveBlocks(config, deepDiveMd);

  // Append the deep-dive section to the existing lesson content
  const separator = "\n\n---\n\n";
  const heading = `## Deep Dive: ${parsed.data.selectedText.slice(0, 100)}\n\n`;
  const updatedContent = lesson.content.trimEnd() + separator + heading + validated;

  await prisma.lesson.update({
    where: { id: lesson.id },
    data: { content: updatedContent },
  });

  revalidatePath(`/courses/${course.slug}/lessons/${lesson.slug}`);
  return { ok: true };
}
