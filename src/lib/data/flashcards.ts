import { prisma } from "@/lib/prisma";
import { courseVisibility } from "@/lib/data/courses";

export type FlashcardData = {
  id: string;
  front: string;
  back: string;
  topic: string;
  tags: string[];
};

/** Published courses (curated + owned) with their flashcard counts. */
export async function getFlashcardsOverview(profileId: string | null) {
  const courses = await prisma.course.findMany({
    where: courseVisibility(profileId),
    orderBy: { createdAt: "asc" },
  });

  return Promise.all(
    courses.map(async (course) => {
      const totalCards = await prisma.flashcard.count({ where: { courseId: course.id } });
      return { ...course, totalCards };
    }),
  );
}

/** All flashcards for a course. */
export async function getFlashcardDeck(courseSlug: string): Promise<FlashcardData[]> {
  const course = await prisma.course.findUnique({ where: { slug: courseSlug } });
  if (!course) return [];

  const cards = await prisma.flashcard.findMany({
    where: { courseId: course.id },
    orderBy: { topic: "asc" },
  });

  return cards.map((c) => ({
    id: c.id,
    front: c.front,
    back: c.back,
    topic: c.topic,
    tags: c.tags,
  }));
}
