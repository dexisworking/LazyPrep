"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/session";

/** Submit quality rating (1=thumbs down, 5=thumbs up) + optional feedback for a lesson. */
export async function rateLesson(lessonId: string, rating: number, feedback?: string) {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false as const, error: "Not authenticated." };

  if (rating !== 1 && rating !== 5) {
    return { ok: false as const, error: "Invalid rating value." };
  }

  await prisma.lessonRating.upsert({
    where: { profileId_lessonId: { profileId: profile.id, lessonId } },
    update: { rating, feedback: feedback?.slice(0, 1000) ?? null },
    create: {
      profileId: profile.id,
      lessonId,
      rating,
      feedback: feedback?.slice(0, 1000) ?? null,
    },
  });

  revalidatePath(`/lessons/${lessonId}`);
  return { ok: true as const };
}

/** Get current user's rating for a lesson. */
export async function getLessonRating(lessonId: string) {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  return prisma.lessonRating.findUnique({
    where: { profileId_lessonId: { profileId: profile.id, lessonId } },
    select: { rating: true, feedback: true },
  });
}
