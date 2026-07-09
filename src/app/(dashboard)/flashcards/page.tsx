import Link from "next/link";
import { Brain, ArrowRight, Layers } from "lucide-react";
import { getCurrentProfile } from "@/lib/session";
import { getFlashcardsOverview } from "@/lib/data/flashcards";

export const dynamic = "force-dynamic";

export default async function FlashcardsPage() {
  const profile = await getCurrentProfile();
  const courses = await getFlashcardsOverview(profile?.id ?? null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Flashcards</h1>
        <p className="text-sm text-muted-foreground">
          Quick-fire recall practice. Flip through decks and earn XP for every card you review.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-card p-10 text-center text-muted-foreground">
          No flashcard decks available yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={course.totalCards > 0 ? `/flashcards/${course.slug}` : "#"}
              className={
                "group flex items-center justify-between gap-4 rounded-xl border border-border/50 bg-card p-5 transition-all " +
                (course.totalCards > 0
                  ? "hover:border-np-success/40 hover:shadow-lg hover:shadow-np-success/5"
                  : "pointer-events-none opacity-60")
              }
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-np-success/20 bg-np-success/10">
                  <Brain className="h-5 w-5 text-np-success" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground group-hover:text-np-success">
                    {course.title}
                  </h3>
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Layers className="h-3.5 w-3.5" />
                    {course.totalCards} card{course.totalCards === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              {course.totalCards > 0 && (
                <ArrowRight className="h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-np-success" />
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
