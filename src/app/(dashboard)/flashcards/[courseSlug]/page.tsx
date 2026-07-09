import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getStudyCards } from "@/lib/data/flashcards";
import { canAccessCourse } from "@/lib/data/courses";
import { getCurrentProfile } from "@/lib/session";
import { FlashcardDeck } from "@/components/flashcards/flashcard-deck";

export const dynamic = "force-dynamic";

export default async function FlashcardDeckPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const course = await prisma.course.findUnique({ where: { slug: courseSlug } });
  if (!course) notFound();

  const profile = await getCurrentProfile();
  if (!canAccessCourse(course, profile?.id ?? null)) notFound();

  const cards = await getStudyCards(courseSlug, profile?.id ?? null, 20);

  return (
    <div className="space-y-6">
      <Link
        href="/flashcards"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Flashcards
      </Link>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{course.title}</h1>
        <p className="text-sm text-muted-foreground">Tap a card to reveal the answer.</p>
      </div>
      <FlashcardDeck cards={cards} backHref="/flashcards" />
    </div>
  );
}
