"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Play, ArrowRight } from "lucide-react";
import { enrollInCourse } from "@/lib/actions/enrollment";

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

  const handleClick = () => {
    setError(false);
    startTransition(async () => {
      try {
        if (!enrolled) await enrollInCourse(courseId);
        router.push(lessonHref);
      } catch {
        setError(true);
      }
    });
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={handleClick}
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : enrolled ? (
          <ArrowRight className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
        {enrolled ? "Continue Learning" : "Start Learning"}
      </button>
      {error && <span className="text-xs text-destructive">Something went wrong. Try again.</span>}
    </div>
  );
}
