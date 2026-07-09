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

  const xpAwarded = XP_REWARDS.FLASHCARD_REVIEW;
  const updates = buildActivityUpdates(profile, { xp: xpAwarded, flashcardsReviewed: 1 });

  await prisma.$transaction([
    prisma.flashcardReview.upsert({
      where: { profileId_flashcardId: { profileId: profile.id, flashcardId } },
      update: {
        easeFactor: next.easeFactor,
        interval: next.interval,
        repetitions: next.repetitions,
        lapses: next.lapses,
        dueDate: next.dueDate,
        lastReviewedAt: new Date(),
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
  return { intervalDays: next.interval, dueLabel: formatInterval(next.interval), xpAwarded };
}
