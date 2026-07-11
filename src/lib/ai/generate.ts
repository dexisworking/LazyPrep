import "server-only";
import { chatJson, chatComplete, AiError, type AiConfig } from "@/lib/ai/client";
import { INTERACTIVE_LANGS, validateBlock } from "@/lib/lesson-blocks";
import type {
  Questionnaire,
  PhaseLevel,
  PhaseBlueprint,
  GeneratedQuestion,
  GeneratedFlashcard,
} from "@/lib/ai/types";

/**
 * The interactive-block syntax cheat sheet taught to the lesson generator.
 * These fenced blocks are rendered by LessonContent as Duolingo-style widgets
 * and infographics (see content/README.md for the authoring reference).
 */
const INTERACTIVE_BLOCK_GUIDE = `
INTERACTIVE BLOCKS — the lesson renderer turns special fenced code blocks into
interactive widgets and infographics. Include 2–4 of them, spread through the
lesson, wherever they genuinely reinforce the material. The fence language
selects the widget; the body must be STRICTLY VALID JSON (double quotes, no
trailing commas, no comments inside the JSON):

\`\`\`quiz
{ "question": "…?", "options": ["A", "B", "C", "D"], "answer": 1, "explanation": "why" }
\`\`\`

\`\`\`flip
{ "title": "Key terms", "cards": [ { "front": "term", "back": "definition" } ] }
\`\`\`

\`\`\`sort
{ "prompt": "Put the steps of … in order", "items": ["first step", "second step", "third step"] }
\`\`\`
(sort items MUST be listed in the CORRECT order — the app shuffles them)

\`\`\`match
{ "prompt": "Match each item to its description", "pairs": [ { "left": "item", "right": "its match" } ] }
\`\`\`

\`\`\`diagram
{ "type": "layers", "title": "…", "layers": [ { "label": "…", "detail": "…", "badge": "1" } ] }
\`\`\`
(diagram "type" can also be "flow" with "steps": [{ "label", "detail" }] for
processes, or "compare" with "left"/"right": { "title", "items": [] } for
side-by-side comparisons)

\`\`\`callout
{ "type": "exam", "body": "One crucial point to remember." }
\`\`\`
(callout "type": "info" | "tip" | "warning" | "exam")

For command-line oriented subjects you may show CLI output in a terminal frame:
\`\`\`term
device# show something
 …output…
\`\`\`

REQUIRED for every lesson:
- At least ONE \`diagram\` block — pick the type that fits the material: "layers"
  for hierarchies/stacks, "flow" for processes/sequences, "compare" for A-vs-B
  contrasts. Prefer a diagram over ASCII art. This is the most illustrative
  element — always include one.
- One \`flip\` block of the lesson's key terms/definitions.
- End the lesson with exactly one \`quiz\` block as a final knowledge check.
Add \`sort\`/\`match\`/\`callout\` blocks too wherever they genuinely help.

Regular fenced code blocks (bash, python, json, …) still work normally for
actual code and are NOT interactive blocks.`;

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

  // Interactive-block target scales with depth/phase: shorter lessons stay light,
  // in-depth/advanced lessons earn more widgets.
  const inDepth =
    ctx.phaseLevel === "advanced" ||
    (!ctx.phaseLevel && ctx.q.depth === "in-depth");
  const concise = !ctx.phaseLevel && ctx.q.depth === "concise";
  const blockTarget = concise ? "2–3" : inDepth ? "4–5" : "3–4";
  const maxTokens = inDepth ? 3600 : 3200;

  const system =
    "You are an expert instructor writing ONE self-contained lesson in GitHub-flavored " +
    "Markdown. Use headings (##, ###), bullet lists, tables, and fenced code blocks where " +
    "they help. Do NOT wrap the whole document in a code fence. Do NOT repeat the lesson " +
    "title as an H1 (the app renders it separately). Start directly with the lesson body.\n" +
    INTERACTIVE_BLOCK_GUIDE;

  const user = `Write the lesson body for:
- Course: ${ctx.courseTitle}
- Module: ${ctx.moduleTitle}
- Chapter: ${ctx.chapterTitle}
- Lesson: "${ctx.lessonTitle}"
- Learner level: ${ctx.q.level}
- Style preferences: ${ctx.q.style || "clear, practical, example-driven"}

${depthGuide}
Focus only on this lesson's topic; assume earlier lessons covered prerequisites.
Weave in ${blockTarget} interactive blocks — including at least one diagram, one flip block, and a closing quiz — as described in the system prompt.`;

  const md = await chatComplete(
    config,
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { temperature: 0.7, maxTokens },
  );

  // Strip an accidental full-document code fence if present.
  const trimmed = md.trim();
  const fenced = trimmed.match(/^```(?:markdown|md)?\s*([\s\S]*?)```$/i);
  const body = (fenced ? fenced[1] : trimmed).trim();

  // Validate the interactive blocks; repair any malformed ones once, then strip
  // whatever still won't parse so a learner never sees raw JSON.
  return finalizeInteractiveBlocks(config, body);
}

// ─── interactive-block validation & repair ───

type FoundBlock = { lang: string; raw: string; fence: string };

/** Fenced blocks whose language is an interactive widget. `fence` is the full ```…``` text. */
export function findInteractiveBlocks(md: string): FoundBlock[] {
  const re = /```([A-Za-z0-9_-]+)\n([\s\S]*?)```/g;
  const out: FoundBlock[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(md)) !== null) {
    const lang = m[1];
    if (INTERACTIVE_LANGS.has(lang)) {
      out.push({ lang, raw: m[2].trim(), fence: m[0] });
    }
  }
  return out;
}

/**
 * Validate every interactive block; if any are malformed, ask the model ONCE to
 * fix just those blocks and splice the corrected versions back in. Any block
 * still invalid after the repair pass is removed entirely. Best-effort: if the
 * repair call fails, we just strip the bad blocks.
 */
export async function finalizeInteractiveBlocks(config: AiConfig, md: string): Promise<string> {
  const blocks = findInteractiveBlocks(md);
  const bad = blocks.filter((b) => !validateBlock(b.lang, b.raw));
  if (bad.length === 0) return md;

  let repaired: FoundBlock[] = [];
  try {
    repaired = await repairBlocks(config, bad);
  } catch {
    repaired = [];
  }

  let result = md;
  for (const b of bad) {
    const fix = repaired.find((r) => r.lang === b.lang && validateBlock(r.lang, r.raw));
    if (fix) {
      result = result.replace(b.fence, "```" + fix.lang + "\n" + fix.raw + "\n```");
    } else {
      // Drop the malformed block (and a trailing blank line) rather than show raw JSON.
      result = result.replace(b.fence + "\n\n", "").replace(b.fence + "\n", "").replace(b.fence, "");
    }
  }
  return result.trim();
}

/** One repair call: send only the malformed fenced blocks, get corrected ones back. */
async function repairBlocks(config: AiConfig, bad: FoundBlock[]): Promise<FoundBlock[]> {
  const system =
    "You fix malformed interactive lesson blocks. Each block is a fenced code block whose " +
    "language names a widget and whose body must be STRICTLY VALID JSON. Return ONLY the same " +
    "number of corrected fenced blocks, in the same order, same languages, no prose between them.\n" +
    INTERACTIVE_BLOCK_GUIDE;

  const user =
    "Fix the JSON in each of these blocks so it exactly matches the schema for its language. " +
    "Preserve the intended content; only correct structure/syntax:\n\n" +
    bad.map((b) => b.fence).join("\n\n");

  const out = await chatComplete(
    config,
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { temperature: 0.2, maxTokens: 1500 },
  );

  return findInteractiveBlocks(out);
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

  const valid = validQuestions(qs);
  if (valid.length === 0) throw new AiError("The model returned no valid checkpoint questions.");
  return valid;
}

/** Keep only structurally sound MCQs from a model response. */
function validQuestions(qs: unknown): GeneratedQuestion[] {
  if (!Array.isArray(qs)) return [];
  return qs.filter(
    (x: GeneratedQuestion) =>
      Array.isArray(x.options) &&
      x.options.length >= 2 &&
      typeof x.correctIdx === "number" &&
      x.correctIdx >= 0 &&
      x.correctIdx < x.options.length &&
      typeof x.text === "string",
  );
}

/** Generate a timed mock test's questions from a course's lesson coverage. */
export async function generateMockTestQuestions(
  config: AiConfig,
  ctx: { courseTitle: string; lessonTitles: string[]; count: number; difficulty: string },
): Promise<GeneratedQuestion[]> {
  const count = Math.min(Math.max(ctx.count, 5), 40);
  const difficultyGuide =
    ctx.difficulty === "mixed"
      ? "Mix difficulties roughly 30% easy / 45% medium / 25% hard."
      : `Every question should be ${ctx.difficulty} difficulty.`;

  const system =
    "You write realistic certification-style exam questions. Output ONLY a valid JSON array — no prose, no code fences.";

  const user = `Create ${count} multiple-choice exam questions for a timed mock test on "${ctx.courseTitle}".
The course covers these lessons — spread the questions across this coverage:
- ${ctx.lessonTitles.slice(0, 80).join("\n- ")}

Output a JSON array of EXACTLY ${count} objects:
[ { "topic": string, "difficulty": "easy"|"medium"|"hard", "text": string, "options": [string, string, string, string], "correctIdx": 0-3, "explanation": string } ]
- Exactly 4 options each, exactly one correct. Plausible distractors.
- "topic" = the specific concept tested (used for the score breakdown).
- ${difficultyGuide}
- Test understanding and application (scenarios, "which would you use…"), not just recall.
- Output ONLY the JSON array.`;

  const qs = await chatJson<GeneratedQuestion[]>(
    config,
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { temperature: 0.6, maxTokens: Math.max(3500, count * 220) },
  );

  const valid = validQuestions(qs);
  if (valid.length === 0) throw new AiError("The model returned no valid questions. Try again.");
  return valid.slice(0, count);
}

/**
 * Generate a course's PRACTICE question bank (mixed difficulty, spread across
 * all lessons). Same MCQ shape as mock tests but tuned for spaced practice
 * rather than a timed exam. Persisted as course `Question` rows.
 */
export async function generatePracticeQuestions(
  config: AiConfig,
  ctx: { courseTitle: string; lessonTitles: string[]; count: number },
): Promise<GeneratedQuestion[]> {
  const count = Math.min(Math.max(ctx.count, 5), 30);
  const system =
    "You write high-quality practice questions for spaced repetition study. Output ONLY a valid JSON array — no prose, no code fences.";

  const user = `Create ${count} multiple-choice practice questions for the course "${ctx.courseTitle}".
Spread them evenly across these lessons so the whole course is covered:
- ${ctx.lessonTitles.slice(0, 80).join("\n- ")}

Output a JSON array of EXACTLY ${count} objects:
[ { "topic": string, "difficulty": "easy"|"medium"|"hard", "text": string, "options": [string, string, string, string], "correctIdx": 0-3, "explanation": string } ]
- Exactly 4 options each, exactly one correct. Plausible distractors.
- "topic" = the specific concept tested.
- Mix difficulties roughly 35% easy / 45% medium / 20% hard.
- Write a clear one-sentence explanation for each answer.
- Output ONLY the JSON array.`;

  const qs = await chatJson<GeneratedQuestion[]>(
    config,
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { temperature: 0.6, maxTokens: Math.max(3000, count * 200) },
  );

  const valid = validQuestions(qs);
  if (valid.length === 0) throw new AiError("The model returned no valid questions. Try again.");
  return valid.slice(0, count);
}

/** Generate additional flashcards for a course, avoiding duplicates. */
export async function generateFlashcardsAi(
  config: AiConfig,
  ctx: {
    courseTitle: string;
    lessonTitles: string[];
    topic?: string;
    count: number;
    existingFronts: string[];
  },
): Promise<GeneratedFlashcard[]> {
  const count = Math.min(Math.max(ctx.count, 3), 30);
  const system =
    "You write concise, high-yield study flashcards. Output ONLY a valid JSON array — no prose, no code fences.";

  const focus = ctx.topic?.trim()
    ? `Focus specifically on: ${ctx.topic.trim()}.`
    : "Cover the highest-yield facts across the whole course.";
  const avoid = ctx.existingFronts.length
    ? `These cards already exist — do NOT duplicate or trivially rephrase them:\n- ${ctx.existingFronts.slice(0, 80).join("\n- ")}`
    : "";

  const user = `Create ${count} flashcards for the course "${ctx.courseTitle}".
The course covers:
- ${ctx.lessonTitles.slice(0, 80).join("\n- ")}

${focus}
${avoid}

Output a JSON array of EXACTLY ${count} objects:
[ { "front": string, "back": string, "topic": string } ]
- "front" is a single crisp question or prompt; "back" is a short, precise answer (1–2 sentences max).
- "topic" is a 1–3 word concept label.
- Prefer facts that reward memorization: numbers, definitions, differences, orderings.
- Output ONLY the JSON array.`;

  const cards = await chatJson<GeneratedFlashcard[]>(
    config,
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { temperature: 0.7, maxTokens: Math.max(2000, count * 120) },
  );

  const valid = Array.isArray(cards)
    ? cards.filter(
        (c) =>
          typeof c.front === "string" &&
          c.front.trim().length > 0 &&
          typeof c.back === "string" &&
          c.back.trim().length > 0,
      )
    : [];
  if (valid.length === 0) throw new AiError("The model returned no valid flashcards. Try again.");
  return valid.slice(0, count).map((c) => ({
    front: c.front.trim().slice(0, 500),
    back: c.back.trim().slice(0, 1000),
    topic: (typeof c.topic === "string" && c.topic.trim() ? c.topic.trim() : "General").slice(0, 60),
  }));
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
