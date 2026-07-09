import { prisma } from "@/lib/prisma";
import { courseVisibility } from "@/lib/data/courses";
import type { SrsState } from "@/lib/srs";

export type StudyCard = {
  id: string;
  front: string;
  back: string;
  topic: string;
  tags: string[];
  isNew: boolean;
  state: SrsState | null;
};

/** Due + new counts for a course/profile. */
export async function getFlashcardCounts(courseId: string, profileId: string | null) {
  const total = await prisma.flashcard.count({ where: { courseId } });
  if (!profileId) return { total, due: 0, newCount: total, learned: 0 };

  const reviewed = await prisma.flashcardReview.count({
    where: { profileId, flashcard: { courseId } },
  });
  const due = await prisma.flashcardReview.count({
    where: { profileId, dueDate: { lte: new Date() }, flashcard: { courseId } },
  });
  return { total, due, newCount: total - reviewed, learned: reviewed };
}

/** Published courses (curated + owned) with flashcard + due counts. */
export async function getFlashcardsOverview(profileId: string | null) {
  const courses = await prisma.course.findMany({
    where: courseVisibility(profileId),
    orderBy: { createdAt: "asc" },
  });

  return Promise.all(
    courses.map(async (course) => {
      const counts = await getFlashcardCounts(course.id, profileId);
      return { ...course, totalCards: counts.total, due: counts.due, newCount: counts.newCount };
    }),
  );
}

/**
 * The study queue for a course: cards due for review first (oldest due first),
 * then new/unseen cards, up to `limit`.
 */
export async function getStudyCards(
  courseSlug: string,
  profileId: string | null,
  limit = 20,
): Promise<StudyCard[]> {
  const course = await prisma.course.findUnique({ where: { slug: courseSlug } });
  if (!course) return [];

  const dueReviews = profileId
    ? await prisma.flashcardReview.findMany({
        where: { profileId, dueDate: { lte: new Date() }, flashcard: { courseId: course.id } },
        orderBy: { dueDate: "asc" },
        include: { flashcard: true },
        take: limit,
      })
    : [];

  const due: StudyCard[] = dueReviews.map((r) => ({
    id: r.flashcard.id,
    front: r.flashcard.front,
    back: r.flashcard.back,
    topic: r.flashcard.topic,
    tags: r.flashcard.tags,
    isNew: false,
    state: {
      easeFactor: r.easeFactor,
      interval: r.interval,
      repetitions: r.repetitions,
      lapses: r.lapses,
    },
  }));

  const remaining = limit - due.length;
  let fresh: StudyCard[] = [];
  if (remaining > 0) {
    const reviewedIds = profileId
      ? (
          await prisma.flashcardReview.findMany({
            where: { profileId, flashcard: { courseId: course.id } },
            select: { flashcardId: true },
          })
        ).map((r) => r.flashcardId)
      : [];

    const newCards = await prisma.flashcard.findMany({
      where: { courseId: course.id, id: { notIn: reviewedIds } },
      orderBy: { topic: "asc" },
      take: remaining,
    });
    fresh = newCards.map((c) => ({
      id: c.id,
      front: c.front,
      back: c.back,
      topic: c.topic,
      tags: c.tags,
      isNew: true,
      state: null,
    }));
  }

  return [...due, ...fresh];
}
