import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { getCurrentProfile } from "@/lib/session";
import { getLessonView, canAccessCourse } from "@/lib/data/courses";
import { recordLessonView } from "@/lib/actions/progress";
import { LessonContent } from "@/components/lesson/lesson-content";
import { LessonGenerator } from "@/components/lesson/lesson-generator";
import { MarkCompleteButton } from "@/components/lesson/mark-complete-button";
import { TutorPanel } from "@/components/tutor/tutor-panel";

export const dynamic = "force-dynamic";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
}) {
  const { courseSlug, lessonSlug } = await params;
  const profile = await getCurrentProfile();
  const view = await getLessonView(courseSlug, lessonSlug, profile?.id ?? null);
  if (!view || !canAccessCourse(view.course, profile?.id ?? null)) notFound();

  const { course, lesson, completed, moduleTitle, chapterTitle, position, total, prev, next } = view;

  // Record that the lesson was opened (for "continue where you left off").
  if (profile) await recordLessonView(lesson.id);

  const coursePath = `/courses/${course.slug}`;
  const lessonHref = (slug: string) => `${coursePath}/lessons/${slug}`;
  const needsGeneration = lesson.content.trim().length === 0;

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

      {/* Content — generated on demand for AI courses */}
      {needsGeneration ? (
        <LessonGenerator lessonId={lesson.id} />
      ) : (
        <>
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
        </>
      )}

      {/* Prev / Next navigation — stacks on mobile, side-by-side from sm up.
          min-w-0 on each card lets the long lesson titles truncate instead of
          forcing the row wider than the phone screen. */}
      <div className="flex flex-col gap-3 border-t border-border/40 pt-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        {prev ? (
          <Link
            href={lessonHref(prev.slug)}
            className="group flex w-full min-w-0 items-center gap-3 rounded-lg border border-border/50 bg-card p-3 transition-colors hover:border-primary/40 sm:flex-1"
          >
            <ChevronLeft className="h-5 w-5 flex-shrink-0 text-muted-foreground group-hover:text-primary" />
            <span className="min-w-0">
              <span className="block text-xs text-muted-foreground">Previous</span>
              <span className="block truncate text-sm font-medium text-foreground">{prev.title}</span>
            </span>
          </Link>
        ) : (
          <span className="hidden sm:block sm:flex-1" />
        )}
        {next ? (
          <Link
            href={lessonHref(next.slug)}
            className="group flex w-full min-w-0 items-center justify-end gap-3 rounded-lg border border-border/50 bg-card p-3 text-right transition-colors hover:border-primary/40 sm:flex-1"
          >
            <span className="min-w-0">
              <span className="block text-xs text-muted-foreground">Next</span>
              <span className="block truncate text-sm font-medium text-foreground">{next.title}</span>
            </span>
            <ChevronRight className="h-5 w-5 flex-shrink-0 text-muted-foreground group-hover:text-primary" />
          </Link>
        ) : (
          <span className="hidden sm:block sm:flex-1" />
        )}
      </div>

      {/* In-context AI tutor (grounded in this lesson) — only once content exists */}
      {profile && !needsGeneration && (
        <TutorPanel courseId={course.id} lessonId={lesson.id} />
      )}
    </div>
  );
}
