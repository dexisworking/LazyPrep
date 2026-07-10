import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getStudyCards } from "@/lib/data/flashcards";
import { canAccessCourse } from "@/lib/data/courses";
import { getCurrentProfile } from "@/lib/session";
import { getAiKeyStatus } from "@/lib/ai/keys";
import { FlashcardDeck } from "@/components/flashcards/flashcard-deck";
import { GenerateCardsDialog } from "@/components/flashcards/generate-cards-dialog";

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

  const [cards, keyStatus] = await Promise.all([
    getStudyCards(courseSlug, profile?.id ?? null, 20),
    profile ? getAiKeyStatus(profile.id) : Promise.resolve({ configured: false as const }),
  ]);

  return (
    <div className="space-y-6">
      <Link
        href="/flashcards"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Flashcards
      </Link>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{course.title}</h1>
          <p className="text-sm text-muted-foreground">Tap a card to reveal the answer.</p>
        </div>
        {profile && (
          <GenerateCardsDialog courseId={course.id} hasAiKey={keyStatus.configured} />
        )}
      </div>
      <FlashcardDeck cards={cards} backHref="/flashcards" />
    </div>
  );
}
