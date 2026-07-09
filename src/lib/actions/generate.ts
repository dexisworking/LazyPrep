"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/session";
import { getAiConfig } from "@/lib/ai/keys";
import { generateCourseBlueprint, generateLessonMarkdown } from "@/lib/ai/generate";
import { AiError } from "@/lib/ai/client";
import type { Questionnaire } from "@/lib/ai/types";

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

/**
 * Generate a course OUTLINE (modules → chapters → lessons, titles only) from
 * the questionnaire, persist it as a user-owned course, and auto-enroll.
 * Lesson bodies are generated lazily on first view (see generateLessonContent).
 */
export async function generateCourse(q: Questionnaire) {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false as const, error: "Not authenticated." };

  const config = await getAiConfig(profile.id);
  if (!config) return { ok: false as const, error: "no-key" };
  if (!q.subject?.trim()) return { ok: false as const, error: "Subject is required." };

  let blueprint;
  try {
    blueprint = await generateCourseBlueprint(config, q);
  } catch (e) {
    return { ok: false as const, error: e instanceof AiError ? e.message : "Generation failed." };
  }

  const slug = `${slugify(blueprint.title, "course")}-${randomSuffix()}`;

  try {
    await prisma.course.create({
      data: {
        slug,
        title: blueprint.title.slice(0, 200),
        description: blueprint.description?.slice(0, 500) ?? null,
        category: q.category || blueprint.category || "custom",
        published: true,
        aiGenerated: true,
        ownerId: profile.id,
        aiContext: q as unknown as Prisma.InputJsonValue,
        modules: {
          create: blueprint.modules.slice(0, 8).map((m, mi) => ({
            title: m.title.slice(0, 200),
            slug: `${slugify(m.title, "module")}-${mi}`,
            order: mi + 1,
            chapters: {
              create: (m.chapters ?? []).slice(0, 5).map((c, ci) => ({
                title: c.title.slice(0, 200),
                slug: `${slugify(c.title, "chapter")}-${ci}`,
                order: ci + 1,
                lessons: {
                  create: (c.lessons ?? []).slice(0, 8).map((l, li) => ({
                    title: l.title.slice(0, 200),
                    slug: `${slugify(l.title, "lesson")}-${li}`,
                    order: li + 1,
                    content: "",
                    estimatedMinutes: Math.min(Math.max(Math.round(l.estimatedMinutes) || 10, 3), 60),
                  })),
                },
              })),
            },
          })),
        },
      },
    });
  } catch {
    return { ok: false as const, error: "Failed to save the generated course." };
  }

  const course = await prisma.course.findUnique({ where: { slug } });
  if (course) {
    await prisma.enrollment
      .create({ data: { profileId: profile.id, courseId: course.id } })
      .catch(() => {});
  }

  revalidatePath("/courses");
  revalidatePath("/dashboard");
  return { ok: true as const, slug };
}

/**
 * Generate one lesson's Markdown body on demand (first time it's opened).
 * Idempotent, and only the course owner can spend their key on it.
 */
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

  const course = lesson.chapter.module.course;
  if (course.ownerId && course.ownerId !== profile.id) {
    return { ok: false as const, error: "Not allowed." };
  }
  if (lesson.content.trim().length > 0) {
    return { ok: true as const }; // already generated
  }

  const q =
    (course.aiContext as unknown as Questionnaire | null) ?? {
      subject: course.title,
      category: course.category,
      level: "beginner" as const,
      goal: "",
      moduleCount: 4,
      depth: "balanced" as const,
      focusTopics: "",
      style: "",
    };

  let md: string;
  try {
    md = await generateLessonMarkdown(config, {
      q,
      courseTitle: course.title,
      moduleTitle: lesson.chapter.module.title,
      chapterTitle: lesson.chapter.title,
      lessonTitle: lesson.title,
    });
  } catch (e) {
    return { ok: false as const, error: e instanceof AiError ? e.message : "Generation failed." };
  }

  await prisma.lesson.update({ where: { id: lesson.id }, data: { content: md } });
  revalidatePath(`/courses/${course.slug}/lessons/${lesson.slug}`);
  return { ok: true as const };
}
