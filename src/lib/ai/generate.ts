import "server-only";
import { chatJson, chatComplete, AiError, type AiConfig } from "@/lib/ai/client";
import type { Questionnaire, CourseBlueprint } from "@/lib/ai/types";

/** Generate the course outline (modules → chapters → lessons, titles only). */
export async function generateCourseBlueprint(
  config: AiConfig,
  q: Questionnaire,
): Promise<CourseBlueprint> {
  const modules = Math.min(Math.max(Math.round(q.moduleCount), 2), 8);

  const system =
    "You are an expert curriculum designer. You output ONLY valid JSON — no prose, " +
    "no markdown code fences, no commentary. The JSON must be parseable as-is.";

  const user = `Design a study course as JSON with EXACTLY this shape:
{
  "title": string,
  "description": string (1-2 sentences),
  "category": one of "certification" | "college" | "competitive" | "custom",
  "modules": [
    {
      "title": string,
      "chapters": [
        { "title": string, "lessons": [ { "title": string, "estimatedMinutes": number } ] }
      ]
    }
  ]
}

Requirements:
- Subject: ${q.subject}
- Learner level: ${q.level}
- Category: ${q.category}
- Goal: ${q.goal || "general mastery"}
- Focus topics to emphasize: ${q.focusTopics || "none in particular — cover the subject comprehensively"}
- Produce EXACTLY ${modules} modules. Each module has 1–3 chapters. Each chapter has 2–4 lessons.
- Order modules and lessons in a logical learning progression.
- Lesson titles must be specific and teachable. estimatedMinutes between 5 and 20.
- Keep titles concise. Output ONLY the JSON object.`;

  const blueprint = await chatJson<CourseBlueprint>(
    config,
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { temperature: 0.6, maxTokens: 3000 },
  );

  if (!blueprint?.title || !Array.isArray(blueprint.modules) || blueprint.modules.length === 0) {
    throw new AiError("The model returned an incomplete course outline. Try again.");
  }
  return blueprint;
}

export type LessonContext = {
  q: Questionnaire;
  courseTitle: string;
  moduleTitle: string;
  chapterTitle: string;
  lessonTitle: string;
};

/** Generate a single lesson's body as GitHub-flavored Markdown. */
export async function generateLessonMarkdown(
  config: AiConfig,
  ctx: LessonContext,
): Promise<string> {
  const depthGuide =
    ctx.q.depth === "concise"
      ? "Keep it tight and scannable (~300–500 words)."
      : ctx.q.depth === "in-depth"
        ? "Be thorough and detailed (~900–1400 words) with multiple examples."
        : "Aim for a balanced length (~600–900 words).";

  const system =
    "You are an expert instructor writing ONE self-contained lesson in GitHub-flavored " +
    "Markdown. Use headings (##, ###), bullet lists, tables, and fenced code blocks where " +
    "they help. Do NOT wrap the whole document in a code fence. Do NOT repeat the lesson " +
    "title as an H1 (the app renders it separately). Start directly with the lesson body.";

  const user = `Write the lesson body for:
- Course: ${ctx.courseTitle}
- Module: ${ctx.moduleTitle}
- Chapter: ${ctx.chapterTitle}
- Lesson: "${ctx.lessonTitle}"
- Learner level: ${ctx.q.level}
- Style preferences: ${ctx.q.style || "clear, practical, example-driven"}

${depthGuide}
Focus only on this lesson's topic; assume earlier lessons covered prerequisites.`;

  const md = await chatComplete(
    config,
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { temperature: 0.7, maxTokens: 2500 },
  );

  // Strip an accidental full-document code fence if present.
  const trimmed = md.trim();
  const fenced = trimmed.match(/^```(?:markdown|md)?\s*([\s\S]*?)```$/i);
  return (fenced ? fenced[1] : trimmed).trim();
}
