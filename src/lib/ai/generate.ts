import "server-only";
import { chatJson, chatComplete, AiError, type AiConfig } from "@/lib/ai/client";
import type {
  Questionnaire,
  PhaseLevel,
  PhaseBlueprint,
  GeneratedQuestion,
} from "@/lib/ai/types";

const PHASE_GUIDE: Record<PhaseLevel, string> = {
  foundation:
    "the FOUNDATION phase. Start from ABSOLUTE BASICS assuming ZERO prior knowledge. Cover the core concepts, terminology, and mental models a complete beginner needs before anything else. Build intuition from the ground up.",
  intermediate:
    "the INTERMEDIATE phase. The learner has cleared the foundations. Build practical, working knowledge: how the pieces fit together, common workflows, and applied problem-solving.",
  advanced:
    "the ADVANCED phase. Go deep and detailed: nuances, edge cases, best practices, trade-offs, and expert-level mastery.",
};

const PHASE_DEPTH: Record<PhaseLevel, string> = {
  foundation:
    "Explain like the reader is brand new. Define every term, use simple analogies, ~500–800 words.",
  intermediate: "Assume the basics are known. Be practical with examples, ~700–1000 words.",
  advanced: "Be thorough and detailed with edge cases and multiple examples, ~1000–1500 words.",
};

export type LessonContext = {
  q: Questionnaire;
  courseTitle: string;
  moduleTitle: string;
  chapterTitle: string;
  lessonTitle: string;
  phaseLevel?: PhaseLevel; // adaptive courses: drives depth by phase
};

/** Generate a single lesson's body as GitHub-flavored Markdown. */
export async function generateLessonMarkdown(
  config: AiConfig,
  ctx: LessonContext,
): Promise<string> {
  const depthGuide = ctx.phaseLevel
    ? PHASE_DEPTH[ctx.phaseLevel]
    : ctx.q.depth === "concise"
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

/**
 * Generate the lesson structure for ONE phase of an adaptive course, informed
 * by what the learner already covered and where they struggled.
 */
export async function generatePhaseBlueprint(
  config: AiConfig,
  q: Questionnaire,
  phase: PhaseLevel,
  context: { learnedLessons: string[]; weakTopics: string[] },
): Promise<PhaseBlueprint> {
  const system =
    "You are an expert curriculum designer building ONE phase of a mastery course. " +
    "Output ONLY valid JSON — no prose, no code fences.";

  const learned = context.learnedLessons.length
    ? `The learner has already completed these lessons — do NOT repeat them, build on them:\n- ${context.learnedLessons.slice(0, 60).join("\n- ")}`
    : "This is the first phase — assume no prior lessons.";
  const weak = context.weakTopics.length
    ? `The learner struggled with these topics on the last checkpoint — reinforce and revisit them within this phase:\n- ${context.weakTopics.slice(0, 20).join("\n- ")}`
    : "";

  const user = `Subject: ${q.subject}
This is ${PHASE_GUIDE[phase]}
${q.focusTopics ? `Emphasize these focus topics where relevant: ${q.focusTopics}` : ""}
Style: ${q.style || "clear, practical, example-driven"}

${learned}
${weak}

Output JSON EXACTLY:
{ "chapters": [ { "title": string, "lessons": [ { "title": string, "estimatedMinutes": number } ] } ] }
- Produce 2–4 chapters, each with 2–4 specific, teachable lessons.
- Progress logically within the phase. Lesson titles must be concrete. estimatedMinutes 5–20.
- Output ONLY the JSON object.`;

  const bp = await chatJson<PhaseBlueprint>(
    config,
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { temperature: 0.6, maxTokens: 2000 },
  );

  if (!bp?.chapters || !Array.isArray(bp.chapters) || bp.chapters.length === 0) {
    throw new AiError("The model returned an incomplete phase outline. Try again.");
  }
  return bp;
}

/** Generate the checkpoint mocktest questions covering a phase's lessons. */
export async function generateCheckpointQuestions(
  config: AiConfig,
  ctx: { subject: string; phaseLabel: string; lessonTitles: string[]; count?: number },
): Promise<GeneratedQuestion[]> {
  const count = ctx.count ?? 8;
  const system =
    "You write exam questions. Output ONLY a valid JSON array — no prose, no code fences.";

  const user = `Create ${count} multiple-choice questions that test mastery of the ${ctx.phaseLabel} phase of a course on "${ctx.subject}".
Cover these lessons:
- ${ctx.lessonTitles.slice(0, 40).join("\n- ")}

Output a JSON array of EXACTLY ${count} objects:
[ { "topic": string, "difficulty": "easy"|"medium"|"hard", "text": string, "options": [string, string, string, string], "correctIdx": 0-3, "explanation": string } ]
- Exactly 4 options each, one correct.
- "topic" = the specific concept tested (used to spot weak areas).
- Mix difficulties, test understanding not just recall. Output ONLY the JSON array.`;

  const qs = await chatJson<GeneratedQuestion[]>(
    config,
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { temperature: 0.6, maxTokens: 3500 },
  );

  const valid = Array.isArray(qs)
    ? qs.filter(
        (x) =>
          Array.isArray(x.options) &&
          x.options.length >= 2 &&
          typeof x.correctIdx === "number" &&
          x.correctIdx >= 0 &&
          x.correctIdx < x.options.length &&
          typeof x.text === "string",
      )
    : [];
  if (valid.length === 0) throw new AiError("The model returned no valid checkpoint questions.");
  return valid;
}

/** Suggest concepts from a completed course that each deserve a deep-dive course. */
export async function generateDeepDiveTopics(
  config: AiConfig,
  ctx: { subject: string; lessonTitles: string[] },
): Promise<string[]> {
  const system =
    "You suggest focused deep-dive topics. Output ONLY a JSON array of short topic strings — no prose, no code fences.";

  const user = `A learner just completed a full mastery course on "${ctx.subject}", covering:
- ${ctx.lessonTitles.slice(0, 60).join("\n- ")}

Suggest 6 important CONCEPTS from this subject that each deserve their own dedicated, from-basics-to-advanced course to truly master in depth. Choose concepts that are central to the subject and rich enough to fill a whole course on their own.
Output a JSON array of EXACTLY 6 concise topic strings, e.g. ["Topic A", "Topic B", ...]. Output ONLY the array.`;

  const topics = await chatJson<string[]>(
    config,
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { temperature: 0.7, maxTokens: 500 },
  );

  const valid = Array.isArray(topics)
    ? topics.filter((t) => typeof t === "string" && t.trim().length > 0).map((t) => t.trim().slice(0, 120))
    : [];
  if (valid.length === 0) throw new AiError("The model returned no topics.");
  return valid.slice(0, 8);
}
