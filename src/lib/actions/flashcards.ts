"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/session";
import { XP_REWARDS } from "@/lib/xp";
import { buildActivityUpdates } from "@/lib/study-activity";
import { scheduleNext, INITIAL_SRS, formatInterval, type ReviewGrade } from "@/lib/srs";

/**
 * Review one flashcard with a grade (again/hard/good/easy). Runs SM-2 to
 * reschedule the card, awards XP, advances the streak, and logs the activity.
 * Returns the next interval so the UI can show "next review in …".
 */
export async function reviewCard(flashcardId: string, grade: ReviewGrade) {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("Not authenticated");

  const flashcard = await prisma.flashcard.findUnique({
    where: { id: flashcardId },
    include: { course: { select: { ownerId: true } } },
  });
  if (!flashcard) throw new Error("Flashcard not found");
  if (flashcard.course.ownerId && flashcard.course.ownerId !== profile.id) {
    throw new Error("Not allowed");
  }
  // Private (AI-generated) cards can only be reviewed by their owner.
  if (flashcard.ownerId && flashcard.ownerId !== profile.id) {
    throw new Error("Not allowed");
  }

  const now = new Date();
  const existing = await prisma.flashcardReview.findUnique({
    where: { profileId_flashcardId: { profileId: profile.id, flashcardId } },
  });
  const prev = existing ?? INITIAL_SRS;
  const next = scheduleNext(
    {
      easeFactor: prev.easeFactor,
      interval: prev.interval,
      repetitions: prev.repetitions,
      lapses: prev.lapses,
    },
    grade,
  );

  // XP is awarded only when the card is actually due (new cards are always due).
  // Re-grading an already-reviewed card that isn't due yet still reschedules it
  // but earns no XP, so it can't be used to farm XP.
  const isDue = !existing || existing.dueDate <= now;
  const baseXp = isDue ? XP_REWARDS.FLASHCARD_REVIEW : 0;
  const updates = buildActivityUpdates(profile, { xp: baseXp, flashcardsReviewed: 1 });

  await prisma.$transaction([
    prisma.flashcardReview.upsert({
      where: { profileId_flashcardId: { profileId: profile.id, flashcardId } },
      update: {
        easeFactor: next.easeFactor,
        interval: next.interval,
        repetitions: next.repetitions,
        lapses: next.lapses,
        dueDate: next.dueDate,
        lastReviewedAt: now,
      },
      create: {
        profileId: profile.id,
        flashcardId,
        easeFactor: next.easeFactor,
        interval: next.interval,
        repetitions: next.repetitions,
        lapses: next.lapses,
        dueDate: next.dueDate,
      },
    }),
    prisma.profile.update(updates.profileUpdate),
    prisma.studySession.upsert(updates.sessionUpsert),
  ]);

  revalidatePath("/dashboard");
  revalidatePath("/flashcards");
  return {
    intervalDays: next.interval,
    dueLabel: formatInterval(next.interval),
    xpAwarded: updates.xpAwarded,
  };
}
