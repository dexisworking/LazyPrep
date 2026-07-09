"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/session";
import { XP_REWARDS } from "@/lib/xp";
import { buildActivityUpdates } from "@/lib/study-activity";

/**
 * Record a completed flashcard review session: awards XP per card reviewed,
 * advances the streak, and logs the activity to today's study session.
 * Called once when a deck is finished.
 */
export async function recordFlashcardReview(count: number) {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("Not authenticated");

  const reviewed = Math.max(0, Math.min(Math.floor(count), 500));
  if (reviewed === 0) return { xpAwarded: 0 };

  const xpAwarded = reviewed * XP_REWARDS.FLASHCARD_REVIEW;
  const updates = buildActivityUpdates(profile, {
    xp: xpAwarded,
    flashcardsReviewed: reviewed,
  });

  await prisma.$transaction([
    prisma.profile.update(updates.profileUpdate),
    prisma.studySession.upsert(updates.sessionUpsert),
  ]);

  revalidatePath("/dashboard");
  return { xpAwarded };
}
