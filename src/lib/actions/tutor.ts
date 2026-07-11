"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/session";
import { getAiConfig } from "@/lib/ai/keys";
import { canAccessCourse } from "@/lib/data/courses";
import { chatComplete, AiError, type ChatMessage } from "@/lib/ai/client";

export type TutorTurn = { role: "user" | "assistant"; content: string };

const MAX_TURNS = 8; // trailing conversation turns sent to the model
const MAX_LESSON_CHARS = 4000; // truncate lesson body used for grounding

/**
 * In-context AI tutor. Grounds the reply in the actual lesson or question the
 * learner is looking at (fetched server-side — the client never supplies the
 * answer key). Stateless: the client holds the thread and sends it each turn.
 */
export async function askTutor(input: {
  courseId: string;
  lessonId?: string;
  questionId?: string;
  messages: TutorTurn[];
}): Promise<
  { ok: true; reply: string } | { ok: false; error: string }
> {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: "Not authenticated." };

  const course = await prisma.course.findUnique({ where: { id: input.courseId } });
  if (!course || !canAccessCourse(course, profile.id)) {
    return { ok: false, error: "Course not found." };
  }

  const config = await getAiConfig(profile.id);
  if (!config) return { ok: false, error: "no-key" };

  if (!Array.isArray(input.messages) || input.messages.length === 0) {
    return { ok: false, error: "Ask a question to start." };
  }

  // Build grounding context from whatever the learner is looking at.
  let context = `The learner is studying the course "${course.title}".`;

  if (input.lessonId) {
    const lesson = await prisma.lesson.findFirst({
      where: { id: input.lessonId, chapter: { module: { courseId: course.id } } },
      select: { title: true, content: true },
    });
    if (lesson) {
      const body = lesson.content.slice(0, MAX_LESSON_CHARS);
      context += `\n\nThey are on the lesson "${lesson.title}". Lesson content:\n"""\n${body}\n"""`;
    }
  }

  if (input.questionId) {
    const q = await prisma.question.findFirst({
      where: { id: input.questionId, courseId: course.id },
      select: { text: true, options: true, correctIdx: true, explanation: true },
    });
    if (q) {
      const options = (q.options as string[]) ?? [];
      const correct = options[q.correctIdx] ?? "(unknown)";
      context +=
        `\n\nThey are reviewing this practice question:\n"""\nQuestion: ${q.text}\n` +
        `Options: ${options.map((o, i) => `${String.fromCharCode(65 + i)}) ${o}`).join("; ")}\n` +
        `Correct answer: ${correct}\nOfficial explanation: ${q.explanation}\n"""`;
    }
  }

  const system =
    "You are a warm, sharp study tutor inside a learning app. Answer the learner's questions using " +
    "the provided context. Be concise and clear; use short paragraphs, analogies, and small examples. " +
    "Use GitHub-flavored Markdown (bullet lists, **bold**, `code`) but keep answers focused — no walls " +
    "of text. If they ask why an answer was wrong, explain the misconception directly and how to reason " +
    "to the right one. If a question falls outside the course context, answer briefly and steer back.\n\n" +
    context;

  // Trim the thread to the most recent turns, cap each turn's length.
  const trimmed: ChatMessage[] = input.messages
    .slice(-MAX_TURNS)
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

  try {
    const reply = await chatComplete(
      config,
      [{ role: "system", content: system }, ...trimmed],
      { temperature: 0.5, maxTokens: 900 },
    );
    return { ok: true, reply: reply.trim() };
  } catch (e) {
    return { ok: false, error: e instanceof AiError ? e.message : "The tutor is unavailable right now." };
  }
}
