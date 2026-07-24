import Link from "next/link";
import { getCurrentProfile } from "@/lib/session";
import { getUserBookmarks } from "@/lib/actions/bookmarks";
import { Bookmark, BookOpen, Brain, Target, ArrowRight } from "lucide-react";
import { BookmarkButton } from "@/components/shared/bookmark-button";

export default async function BookmarksPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const { questions, flashcards, lessons } = await getUserBookmarks();
  const totalCount = questions.length + flashcards.length + lessons.length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bookmarks</h1>
        <p className="text-sm text-muted-foreground">
          Your saved questions, flashcards, and lessons for quick review.
        </p>
      </div>

      {totalCount === 0 ? (
        <div className="rounded-2xl border border-border/50 bg-card p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
            <Bookmark className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold">No bookmarks yet</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Save questions, flashcards, or lessons while studying to review them anytime in one place.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Lessons Section */}
          {lessons.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <BookOpen className="h-5 w-5 text-accent" />
                <h2>Lessons ({lessons.length})</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {lessons.map((lesson) => {
                  const course = lesson.chapter.module.course;
                  return (
                    <div
                      key={lesson.id}
                      className="group relative flex flex-col justify-between rounded-xl border border-border/50 bg-card p-5 shadow-sm transition-all hover:border-border hover:shadow-md"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="font-medium text-accent">{course.title}</span>
                          <BookmarkButton targetType="lesson" targetId={lesson.id} initialBookmarked={true} />
                        </div>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {lesson.title}
                        </h3>
                      </div>
                      <Link
                        href={`/courses/${course.slug}/lessons/${lesson.slug}`}
                        className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        Read lesson <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Flashcards Section */}
          {flashcards.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Brain className="h-5 w-5 text-np-success" />
                <h2>Flashcards ({flashcards.length})</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {flashcards.map((card) => (
                  <div
                    key={card.id}
                    className="flex flex-col justify-between rounded-xl border border-border/50 bg-card p-5 shadow-sm"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-medium text-np-success">{card.course.title}</span>
                        <BookmarkButton targetType="flashcard" targetId={card.id} initialBookmarked={true} />
                      </div>
                      <p className="font-medium text-foreground text-sm">{card.front}</p>
                      <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                        {card.back}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Questions Section */}
          {questions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Target className="h-5 w-5 text-np-red" />
                <h2>Questions ({questions.length})</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {questions.map((q) => (
                  <div
                    key={q.id}
                    className="flex flex-col justify-between rounded-xl border border-border/50 bg-card p-5 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-medium text-np-red">{q.course.title} · {q.topic}</span>
                      <BookmarkButton targetType="question" targetId={q.id} initialBookmarked={true} />
                    </div>
                    <p className="font-medium text-foreground text-sm">{q.text}</p>
                    <div className="text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/30">
                      <span className="font-semibold text-foreground">Explanation:</span> {q.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
