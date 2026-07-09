"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/session";
import { getAiConfig } from "@/lib/ai/keys";
import {
  generatePhaseBlueprint,
  generateLessonMarkdown,
  generateDeepDiveTopics,
} from "@/lib/ai/generate";
import { AiError } from "@/lib/ai/client";
import type { Questionnaire, PhaseBlueprint, PhaseLevel } from "@/lib/ai/types";

// ─── shared helpers (not exported — "use server" only exports async actions) ───

function slugify(input: string, fallback: string): string {
  const s = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return s || fallback;
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 8);
}

function clampMinutes(m: number): number {
  return Math.min(Math.max(Math.round(m) || 10, 3), 60);
}

function aiError(e: unknown): string {
  return e instanceof AiError ? e.message : "Generation failed. Try again.";
}

function fallbackQuestionnaire(course: {
  title: string;
  category: string;
}): Questionnaire {
  return {
    subject: course.title,
    category: course.category,
    level: "beginner",
    goal: "",
    moduleCount: 3,
    depth: "balanced",
    focusTopics: "",
    style: "",
  };
}

const PHASE_ORDER: PhaseLevel[] = ["foundation", "intermediate", "advanced"];
const PHASE_TITLE: Record<PhaseLevel, string> = {
  foundation: "Foundation",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

/** Write a phase's chapters + (empty) lessons under a module, then mark generated. */
async function writePhaseContent(moduleId: string, blueprint: PhaseBlueprint) {
  const chapters = blueprint.chapters.slice(0, 5);
  for (const [ci, ch] of chapters.entries()) {
    await prisma.chapter.create({
      data: {
        moduleId,
        title: ch.title.slice(0, 200),
        slug: `${slugify(ch.title, "chapter")}-${ci}`,
        order: ci + 1,
        lessons: {
          create: (ch.lessons ?? []).slice(0, 6).map((l, li) => ({
            title: l.title.slice(0, 200),
            slug: `${slugify(l.title, "lesson")}-${li}`,
            order: li + 1,
            content: "",
            estimatedMinutes: clampMinutes(l.estimatedMinutes),
          })),
        },
      },
    });
  }
  await prisma.module.update({ where: { id: moduleId }, data: { contentGenerated: true } });
}

// ─── actions ───

type CreateResult = { ok: true; slug: string } | { ok: false; error: string };

/** Shared adaptive-course creation (used by generateCourse and spawnDeepDive). */
async function createAdaptiveCourse(
  profileId: string,
  config: Parameters<typeof generatePhaseBlueprint>[0],
  q: Questionnaire,
  parentId?: string,
): Promise<CreateResult> {
  // Generate the Foundation phase structure first.
  let foundation: PhaseBlueprint;
  try {
    foundation = await generatePhaseBlueprint(config, q, "foundation", {
      learnedLessons: [],
      weakTopics: [],
    });
  } catch (e) {
    return { ok: false, error: aiError(e) };
  }

  const title = q.subject.trim().slice(0, 150);
  const slug = `${slugify(title, "course")}-${randomSuffix()}`;

  let course: { id: string; modules: { id: string; phaseLevel: string | null }[] };
  try {
    course = await prisma.course.create({
      data: {
        slug,
        title,
        description: `A ground-up mastery path for ${q.subject.trim()}.`.slice(0, 300),
        category: q.category || "custom",
        published: true,
        aiGenerated: true,
        adaptive: true,
        ownerId: profileId,
        parentId: parentId ?? null,
        aiContext: q as unknown as Prisma.InputJsonValue,
        modules: {
          create: PHASE_ORDER.map((level, i) => ({
            title: PHASE_TITLE[level],
            slug: level,
            order: i + 1,
            phaseLevel: level,
            locked: i > 0, // only Foundation unlocked
            contentGenerated: false,
            checkpoint: { create: {} },
          })),
        },
      },
      include: { modules: true },
    });
  } catch {
    return { ok: false, error: "Failed to save the course." };
  }

  const foundationModule = course.modules.find((m) => m.phaseLevel === "foundation");
  if (foundationModule) {
    try {
      await writePhaseContent(foundationModule.id, foundation);
    } catch {
      // Foundation content failed to write; the phase can be regenerated on view.
    }
  }

  await prisma.enrollment
    .create({ data: { profileId, courseId: course.id } })
    .catch(() => {});

  revalidatePath("/courses");
  revalidatePath("/dashboard");
  return { ok: true, slug };
}

/**
 * Create an ADAPTIVE mastery course: 3 phases (Foundation/Intermediate/Advanced).
 * Foundation is generated now; the later phases stay locked until their
 * checkpoint is passed, then are generated adaptively.
 */
export async function generateCourse(q: Questionnaire) {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false as const, error: "Not authenticated." };

  const config = await getAiConfig(profile.id);
  if (!config) return { ok: false as const, error: "no-key" };
  if (!q.subject?.trim()) return { ok: false as const, error: "Subject is required." };

  return createAdaptiveCourse(profile.id, config, q);
}

/** Suggest deep-dive topics from a fully-completed course. */
export async function suggestDeepDiveTopics(courseId: string) {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false as const, error: "Not authenticated." };

  const config = await getAiConfig(profile.id);
  if (!config) return { ok: false as const, error: "no-key" };

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { modules: { include: { chapters: { include: { lessons: { select: { title: true } } } } } } },
  });
  if (!course || course.ownerId !== profile.id) return { ok: false as const, error: "Not allowed." };

  const lessonTitles = course.modules.flatMap((m) =>
    m.chapters.flatMap((c) => c.lessons.map((l) => l.title)),
  );
  const subject =
    (course.aiContext as unknown as Questionnaire | null)?.subject ?? course.title;

  try {
    const topics = await generateDeepDiveTopics(config, { subject, lessonTitles });
    return { ok: true as const, topics };
  } catch (e) {
    return { ok: false as const, error: aiError(e) };
  }
}

/**
 * Spawn a new deep-dive course focused on one concept from a mastered course.
 * Runs the same adaptive cycle, linked to the parent.
 */
export async function spawnDeepDive(parentCourseId: string, topic: string) {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false as const, error: "Not authenticated." };

  const config = await getAiConfig(profile.id);
  if (!config) return { ok: false as const, error: "no-key" };

  const t = topic.trim();
  if (!t) return { ok: false as const, error: "Pick a topic." };

  const parent = await prisma.course.findUnique({
    where: { id: parentCourseId },
    include: { modules: { include: { checkpoint: true } } },
  });
  if (!parent || parent.ownerId !== profile.id) return { ok: false as const, error: "Not allowed." };

  const mastered =
    parent.adaptive &&
    parent.modules.length > 0 &&
    parent.modules.every((m) => m.checkpoint?.passed);
  if (!mastered) return { ok: false as const, error: "Finish the course first." };

  const parentQ = parent.aiContext as unknown as Questionnaire | null;
  const q: Questionnaire = {
    subject: t,
    category: parentQ?.category ?? parent.category ?? "custom",
    level: "beginner",
    goal: `Master ${t} in depth`,
    moduleCount: 3,
    depth: "in-depth",
    focusTopics: t,
    style: parentQ?.style ?? "",
  };

  return createAdaptiveCourse(profile.id, config, q, parent.id);
}

/** Titles of all lessons in phases before `beforeOrder` (what the learner covered). */
async function priorPhaseLessonTitles(courseId: string, beforeOrder: number): Promise<string[]> {
  const lessons = await prisma.lesson.findMany({
    where: { chapter: { module: { courseId, order: { lt: beforeOrder } } } },
    select: { title: true },
  });
  return lessons.map((l) => l.title);
}

/**
 * Generate a phase's lessons on demand (adaptive: uses prior lessons + the
 * previous checkpoint's weak topics). Called when an unlocked phase is opened.
 */
export async function generatePhase(moduleId: string) {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false as const, error: "Not authenticated." };

  const config = await getAiConfig(profile.id);
  if (!config) return { ok: false as const, error: "no-key" };

  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { course: true },
  });
  if (!mod || !mod.phaseLevel) return { ok: false as const, error: "Phase not found." };
  if (mod.course.ownerId !== profile.id) return { ok: false as const, error: "Not allowed." };
  if (mod.locked) return { ok: false as const, error: "This phase is locked." };
  if (mod.contentGenerated) return { ok: true as const };

  const q =
    (mod.course.aiContext as unknown as Questionnaire | null) ?? fallbackQuestionnaire(mod.course);
  const learned = await priorPhaseLessonTitles(mod.courseId, mod.order);
  const prev =
    mod.order > 1
      ? await prisma.module.findFirst({
          where: { courseId: mod.courseId, order: mod.order - 1 },
          include: { checkpoint: true },
        })
      : null;
  const weakTopics = prev?.checkpoint?.weakTopics ?? [];

  try {
    const bp = await generatePhaseBlueprint(config, q, mod.phaseLevel as PhaseLevel, {
      learnedLessons: learned,
      weakTopics,
    });
    await writePhaseContent(mod.id, bp);
  } catch (e) {
    return { ok: false as const, error: aiError(e) };
  }

  revalidatePath(`/courses/${mod.course.slug}`);
  return { ok: true as const };
}

/** Generate a single lesson's Markdown body on demand (phase-aware). */
export async function generateLessonContent(lessonId: string) {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false as const, error: "Not authenticated." };

  const config = await getAiConfig(profile.id);
  if (!config) return { ok: false as const, error: "no-key" };

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { chapter: { include: { module: { include: { course: true } } } } },
  });
  if (!lesson) return { ok: false as const, error: "Lesson not found." };

  const module = lesson.chapter.module;
  const course = module.course;
  if (course.ownerId && course.ownerId !== profile.id) {
    return { ok: false as const, error: "Not allowed." };
  }
  if (lesson.content.trim().length > 0) return { ok: true as const };

  const q =
    (course.aiContext as unknown as Questionnaire | null) ?? fallbackQuestionnaire(course);

  let md: string;
  try {
    md = await generateLessonMarkdown(config, {
      q,
      courseTitle: course.title,
      moduleTitle: module.title,
      chapterTitle: lesson.chapter.title,
      lessonTitle: lesson.title,
      phaseLevel: (module.phaseLevel as PhaseLevel | null) ?? undefined,
    });
  } catch (e) {
    return { ok: false as const, error: aiError(e) };
  }

  await prisma.lesson.update({ where: { id: lesson.id }, data: { content: md } });
  revalidatePath(`/courses/${course.slug}/lessons/${lesson.slug}`);
  return { ok: true as const };
}
