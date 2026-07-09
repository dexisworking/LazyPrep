"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Zap } from "lucide-react";
import { markLessonComplete } from "@/lib/actions/progress";

export function MarkCompleteButton({
  lessonId,
  coursePath,
  initialCompleted,
  nextHref,
}: {
  lessonId: string;
  coursePath: string;
  initialCompleted: boolean;
  nextHref: string | null;
}) {
  const router = useRouter();
  const [completed, setCompleted] = useState(initialCompleted);
  const [xpGained, setXpGained] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleComplete = () => {
    startTransition(async () => {
      const result = await markLessonComplete(lessonId, coursePath);
      setCompleted(true);
      if (!result.alreadyComplete && result.xpAwarded > 0) {
        setXpGained(result.xpAwarded);
      }
      router.refresh();
    });
  };

  if (completed) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-lg border border-np-success/30 bg-np-success/10 px-4 py-2.5 text-sm font-semibold text-np-success">
          <CheckCircle2 className="h-4 w-4" />
          Completed
        </span>
        {xpGained !== null && (
          <span className="inline-flex items-center gap-1 text-sm font-medium text-np-xp">
            <Zap className="h-4 w-4" />+{xpGained} XP
          </span>
        )}
        {nextHref && (
          <button
            onClick={() => router.push(nextHref)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
          >
            Next lesson
          </button>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleComplete}
      disabled={isPending}
      className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
      Mark as Complete
    </button>
  );
}
