"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, Loader2, Play, Plus } from "lucide-react";

import { enrollInCourse } from "@/lib/actions/enrollment";

/**
 * The course header's primary action.
 *
 * Enrolling is a deliberate, separate step. This previously enrolled you as a
 * side effect of clicking "Start Learning" and navigated straight into a
 * lesson, so there was no way to look at a curated course without joining it.
 * An un-enrolled visitor now gets an explicit **Enroll** button plus a preview
 * link that leaves no trace.
 */
export function StartCourseButton({
  courseId,
  lessonHref,
  enrolled,
}: {
  courseId: string;
  lessonHref: string | null;
  enrolled: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(false);

  if (!lessonHref) return null;

  const handleEnroll = () => {
    setError(false);
    startTransition(async () => {
      try {
        await enrollInCourse(courseId);
        // Stay on the course page — the header flips to "Continue Learning"
        // and the dashboard picks the course up as the active one.
        router.refresh();
      } catch {
        setError(true);
      }
    });
  };

  if (enrolled) {
    return (
      <Link
        href={lessonHref}
        className="inline-flex items-center gap-2 rounded-control bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-[background-color,border-color,color,box-shadow,opacity,transform] hover:opacity-90"
      >
        <ArrowRight className="h-4 w-4" />
        Continue Learning
      </Link>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleEnroll}
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-control bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-[background-color,border-color,color,box-shadow,opacity,transform] hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Enroll in this course
        </button>
        <Link
          href={lessonHref}
          className="inline-flex items-center gap-2 rounded-control border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <Play className="h-3.5 w-3.5" />
          Preview a lesson
        </Link>
      </div>
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <BookOpen className="h-3.5 w-3.5" />
        Enroll to track progress and pin it to your dashboard.
      </span>
      {error && <span className="text-xs text-destructive">Something went wrong. Try again.</span>}
    </div>
  );
}
