"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/session";

export type BookmarkTargetType = "question" | "flashcard" | "lesson";

/**
 * Toggle a bookmark for the signed-in user on a specific item.
 * Creates the bookmark if missing; deletes it if it already exists.
 */
export async function toggleBookmark(targetType: BookmarkTargetType, targetId: string) {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false as const, error: "Not authenticated." };

  const existing = await prisma.bookmark.findUnique({
    where: {
      profileId_targetType_targetId: {
        profileId: profile.id,
        targetType,
        targetId,
      },
    },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    revalidatePath("/bookmarks");
    return { ok: true as const, isBookmarked: false };
  } else {
    await prisma.bookmark.create({
      data: {
        profileId: profile.id,
        targetType,
        targetId,
      },
    });
    revalidatePath("/bookmarks");
    return { ok: true as const, isBookmarked: true };
  }
}

/**
 * Check if a specific target is bookmarked by the signed-in user.
 */
export async function isBookmarked(targetType: BookmarkTargetType, targetId: string): Promise<boolean> {
  const profile = await getCurrentProfile();
  if (!profile) return false;

  const count = await prisma.bookmark.count({
    where: {
      profileId: profile.id,
      targetType,
      targetId,
    },
  });

  return count > 0;
}

/**
 * Get all bookmarks for the signed-in user, populated with target item details.
 */
export async function getUserBookmarks() {
  const profile = await getCurrentProfile();
  if (!profile) return { questions: [], flashcards: [], lessons: [] };

  const bookmarks = await prisma.bookmark.findMany({
    where: { profileId: profile.id },
    orderBy: { createdAt: "desc" },
  });

  const questionIds = bookmarks.filter((b) => b.targetType === "question").map((b) => b.targetId);
  const flashcardIds = bookmarks.filter((b) => b.targetType === "flashcard").map((b) => b.targetId);
  const lessonIds = bookmarks.filter((b) => b.targetType === "lesson").map((b) => b.targetId);

  const [questions, flashcards, lessons] = await Promise.all([
    questionIds.length > 0
      ? prisma.question.findMany({
          where: { id: { in: questionIds } },
          include: { course: { select: { title: true, slug: true } } },
        })
      : [],
    flashcardIds.length > 0
      ? prisma.flashcard.findMany({
          where: { id: { in: flashcardIds } },
          include: { course: { select: { title: true, slug: true } } },
        })
      : [],
    lessonIds.length > 0
      ? prisma.lesson.findMany({
          where: { id: { in: lessonIds } },
          include: { chapter: { include: { module: { include: { course: { select: { title: true, slug: true } } } } } } },
        })
      : [],
  ]);

  return {
    questions,
    flashcards,
    lessons,
  };
}
