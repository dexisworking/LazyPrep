import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { getCurrentProfile } from "@/lib/session";
import { getLessonView } from "@/lib/data/courses";
import { recordLessonView } from "@/lib/actions/progress";
import { LessonContent } from "@/components/lesson/lesson-content";
import { MarkCompleteButton } from "@/components/lesson/mark-complete-button";

export const dynamic = "force-dynamic";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
}) {
  const { courseSlug, lessonSlug } = await params;
  const profile = await getCurrentProfile();
  const view = await getLessonView(courseSlug, lessonSlug, profile?.id ?? null);
  if (!view) notFound();

  const { course, lesson, completed, moduleTitle, chapterTitle, position, total, prev, next } = view;

  // Record that the lesson was opened (for "continue where you left off").
  if (profile) await recordLessonView(lesson.id);

  const coursePath = `/courses/${course.slug}`;
  const lessonHref = (slug: string) => `${coursePath}/lessons/${slug}`;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href={coursePath} className="inline-flex items-center gap-1 transition-colors hover:text-foreground">
          <ChevronLeft className="h-4 w-4" />
          {course.title}
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-3 border-b border-border/40 pb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-primary">
          {moduleTitle} · {chapterTitle}
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{lesson.title}</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {lesson.estimatedMinutes} min
          </span>
          <span>
            Lesson {position} of {total}
          </span>
        </div>
      </div>

      {/* Content */}
      <LessonContent content={lesson.content} />

      {/* Complete action */}
      <div className="border-t border-border/40 pt-6">
        <MarkCompleteButton
          lessonId={lesson.id}
          coursePath={coursePath}
          initialCompleted={completed}
          nextHref={next ? lessonHref(next.slug) : null}
        />
      </div>

      {/* Prev / Next navigation */}
      <div className="flex items-center justify-between gap-4 border-t border-border/40 pt-6">
        {prev ? (
          <Link
            href={lessonHref(prev.slug)}
            className="group flex flex-1 items-center gap-3 rounded-lg border border-border/50 bg-card p-3 transition-colors hover:border-primary/40"
          >
            <ChevronLeft className="h-5 w-5 flex-shrink-0 text-muted-foreground group-hover:text-primary" />
            <span className="min-w-0">
              <span className="block text-xs text-muted-foreground">Previous</span>
              <span className="block truncate text-sm font-medium text-foreground">{prev.title}</span>
            </span>
          </Link>
        ) : (
          <span className="flex-1" />
        )}
        {next ? (
          <Link
            href={lessonHref(next.slug)}
            className="group flex flex-1 items-center justify-end gap-3 rounded-lg border border-border/50 bg-card p-3 text-right transition-colors hover:border-primary/40"
          >
            <span className="min-w-0">
              <span className="block text-xs text-muted-foreground">Next</span>
              <span className="block truncate text-sm font-medium text-foreground">{next.title}</span>
            </span>
            <ChevronRight className="h-5 w-5 flex-shrink-0 text-muted-foreground group-hover:text-primary" />
          </Link>
        ) : (
          <span className="flex-1" />
        )}
      </div>
    </div>
  );
}
