"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/session";
import { canAccessCourse } from "@/lib/data/courses";

// ─── Validation ───

const addEntrySchema = z.object({
  courseId: z.string().min(1).max(64),
  content: z.string().min(1).max(5000),
  sourceType: z.enum(["highlight", "manual", "drag"]).default("manual"),
  moduleId: z.string().max(64).optional(),
  moduleTitle: z.string().max(200).optional(),
  lessonId: z.string().max(64).optional(),
  lessonTitle: z.string().max(200).optional(),
});

const updateEntrySchema = z.object({
  entryId: z.string().min(1).max(64),
  content: z.string().min(1).max(5000),
});

// ─── Helpers ───

/** Get or create the user's notepad for a course. */
async function getOrCreateNotepad(profileId: string, courseId: string) {
  return prisma.notepad.upsert({
    where: { profileId_courseId: { profileId, courseId } },
    create: { profileId, courseId },
    update: {},
  });
}

// ─── Actions ───

export type NotepadEntryData = {
  id: string;
  content: string;
  sourceType: string;
  moduleId: string | null;
  moduleTitle: string | null;
  lessonId: string | null;
  lessonTitle: string | null;
  createdAt: Date;
};

export type NotepadData = {
  id: string;
  entries: NotepadEntryData[];
};

/**
 * Get the user's notepad for a course (with all entries).
 * Creates the notepad if it doesn't exist yet.
 */
export async function getNotepad(
  courseId: string,
): Promise<{ ok: true; notepad: NotepadData } | { ok: false; error: string }> {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: "Not authenticated." };

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || !canAccessCourse(course, profile.id)) {
    return { ok: false, error: "Course not found." };
  }

  const notepad = await getOrCreateNotepad(profile.id, courseId);
  const entries = await prisma.notepadEntry.findMany({
    where: { notepadId: notepad.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      content: true,
      sourceType: true,
      moduleId: true,
      moduleTitle: true,
      lessonId: true,
      lessonTitle: true,
      createdAt: true,
    },
  });

  return { ok: true, notepad: { id: notepad.id, entries } };
}

/**
 * Add a new entry to the user's notepad.
 * Auto-creates the notepad if it doesn't exist.
 */
export async function addNotepadEntry(input: {
  courseId: string;
  content: string;
  sourceType?: "highlight" | "manual" | "drag";
  moduleId?: string;
  moduleTitle?: string;
  lessonId?: string;
  lessonTitle?: string;
}): Promise<
  { ok: true; entry: NotepadEntryData } | { ok: false; error: string }
> {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: "Not authenticated." };

  const parsed = addEntrySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input." };

  const { courseId, content, sourceType, moduleId, moduleTitle, lessonId, lessonTitle } =
    parsed.data;

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || !canAccessCourse(course, profile.id)) {
    return { ok: false, error: "Course not found." };
  }

  const notepad = await getOrCreateNotepad(profile.id, courseId);

  const entry = await prisma.notepadEntry.create({
    data: {
      notepadId: notepad.id,
      content: content.trim(),
      sourceType: sourceType ?? "manual",
      moduleId: moduleId ?? null,
      moduleTitle: moduleTitle ?? null,
      lessonId: lessonId ?? null,
      lessonTitle: lessonTitle ?? null,
    },
    select: {
      id: true,
      content: true,
      sourceType: true,
      moduleId: true,
      moduleTitle: true,
      lessonId: true,
      lessonTitle: true,
      createdAt: true,
    },
  });

  return { ok: true, entry };
}

/** Update an existing notepad entry's content. */
export async function updateNotepadEntry(
  entryId: string,
  content: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: "Not authenticated." };

  const parsed = updateEntrySchema.safeParse({ entryId, content });
  if (!parsed.success) return { ok: false, error: "Invalid input." };

  const entry = await prisma.notepadEntry.findUnique({
    where: { id: entryId },
    include: { notepad: { select: { profileId: true } } },
  });

  if (!entry || entry.notepad.profileId !== profile.id) {
    return { ok: false, error: "Entry not found." };
  }

  await prisma.notepadEntry.update({
    where: { id: entryId },
    data: { content: parsed.data.content.trim() },
  });

  return { ok: true };
}

/** Delete a single notepad entry. */
export async function deleteNotepadEntry(
  entryId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: "Not authenticated." };

  const entry = await prisma.notepadEntry.findUnique({
    where: { id: entryId },
    include: { notepad: { select: { profileId: true } } },
  });

  if (!entry || entry.notepad.profileId !== profile.id) {
    return { ok: false, error: "Entry not found." };
  }

  await prisma.notepadEntry.delete({ where: { id: entryId } });
  return { ok: true };
}

/** Delete all entries in a user's notepad for a course. */
export async function clearNotepad(
  courseId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: "Not authenticated." };

  const notepad = await prisma.notepad.findUnique({
    where: { profileId_courseId: { profileId: profile.id, courseId } },
  });

  if (!notepad) return { ok: true }; // nothing to clear

  await prisma.notepadEntry.deleteMany({ where: { notepadId: notepad.id } });
  return { ok: true };
}
