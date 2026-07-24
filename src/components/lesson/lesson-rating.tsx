"use client";

import { useState, useTransition } from "react";
import { ThumbsUp, ThumbsDown, Check } from "lucide-react";
import { rateLesson } from "@/lib/actions/lesson-rating";
import { cn } from "@/lib/utils";

export function LessonRatingWidget({
  lessonId,
  initialRating,
}: {
  lessonId: string;
  initialRating?: number | null;
}) {
  const [rating, setRating] = useState<number | null>(initialRating ?? null);
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleRate = (value: number) => {
    setRating(value);
    setSubmitted(true);

    startTransition(async () => {
      await rateLesson(lessonId, value);
    });
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-border/40 bg-card/60 p-4">
      <div className="space-y-0.5">
        <p className="text-xs font-semibold text-foreground">Was this lesson helpful?</p>
        <p className="text-[11px] text-muted-foreground">Your feedback improves AI content quality.</p>
      </div>

      <div className="flex items-center gap-2">
        {submitted && (
          <span className="flex items-center gap-1 text-xs font-medium text-np-success mr-2">
            <Check className="h-3.5 w-3.5" /> Thanks!
          </span>
        )}

        <button
          type="button"
          disabled={isPending}
          onClick={() => handleRate(5)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg border border-border/50 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-secondary",
            rating === 5 && "border-np-success/40 bg-np-success/10 text-np-success",
          )}
        >
          <ThumbsUp className="h-3.5 w-3.5" /> Yes
        </button>

        <button
          type="button"
          disabled={isPending}
          onClick={() => handleRate(1)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg border border-border/50 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-secondary",
            rating === 1 && "border-destructive/40 bg-destructive/10 text-destructive",
          )}
        >
          <ThumbsDown className="h-3.5 w-3.5" /> No
        </button>
      </div>
    </div>
  );
}
