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
  const ids = courses.map((c) => c.id);
  if (ids.length === 0) return [];

  // Total cards per course — one grouped query.
  const cardCounts = await prisma.flashcard.groupBy({
    by: ["courseId"],
    where: { courseId: { in: ids } },
    _count: { _all: true },
  });
  const totalByCourse = new Map(cardCounts.map((g) => [g.courseId, g._count._all]));

  // Reviewed + due per course for this profile — one query, tallied in JS.
  const now = new Date();
  const reviewedByCourse = new Map<string, number>();
  const dueByCourse = new Map<string, number>();
  if (profileId) {
    const reviews = await prisma.flashcardReview.findMany({
      where: { profileId, flashcard: { courseId: { in: ids } } },
      select: { dueDate: true, flashcard: { select: { courseId: true } } },
    });
    for (const r of reviews) {
      const cid = r.flashcard.courseId;
      reviewedByCourse.set(cid, (reviewedByCourse.get(cid) ?? 0) + 1);
      if (r.dueDate <= now) dueByCourse.set(cid, (dueByCourse.get(cid) ?? 0) + 1);
    }
  }

  return courses.map((course) => {
    const total = totalByCourse.get(course.id) ?? 0;
    const reviewed = reviewedByCourse.get(course.id) ?? 0;
    return {
      ...course,
      totalCards: total,
      due: dueByCourse.get(course.id) ?? 0,
      newCount: total - reviewed,
    };
  });
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
