"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/session";

/**
 * Delete a course the current user created. Cascades to its modules, chapters,
 * lessons, checkpoints, questions, flashcards, enrollments and progress. Any
 * deep-dive courses spawned from it are kept (their parent link is nulled).
 * Curated/global courses (ownerId = null) cannot be deleted by users.
 */
export async function deleteCourse(courseId: string) {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false as const, error: "Not authenticated." };

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { ownerId: true },
  });
  if (!course) return { ok: false as const, error: "Course not found." };
  if (course.ownerId !== profile.id) {
    return { ok: false as const, error: "You can only delete courses you created." };
  }

  await prisma.course.delete({ where: { id: courseId } });

  revalidatePath("/courses");
  revalidatePath("/dashboard");
  return { ok: true as const };
}
