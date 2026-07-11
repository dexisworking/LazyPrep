"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Loader2, Target, RotateCcw, BookOpen, X } from "lucide-react";
import { setExamDate } from "@/lib/actions/study-plan";
import { computeDailyTarget, daysUntil, formatCountdown } from "@/lib/study-plan";

/**
 * Per-course exam planner: set a target date, then see a live countdown and
 * today's suggested workload (lessons to cover + reviews due). All math is the
 * pure helper in lib/study-plan.ts.
 */
export function ExamPlanCard({
  courseId,
  examDateIso,
  remainingLessons,
  dueReviews,
}: {
  courseId: string;
  examDateIso: string | null; // yyyy-mm-dd or null
  remainingLessons: number;
  dueReviews: number;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(examDateIso ?? "");
  const [isPending, startTransition] = useTransition();

  const save = (iso: string | null) => {
    startTransition(async () => {
      await setExamDate(courseId, iso);
      setEditing(false);
      router.refresh();
    });
  };

  const today = new Date().toISOString().slice(0, 10);

  // No date set yet (and not editing) → compact prompt.
  if (!examDateIso && !editing) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-border/40 bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
            <CalendarDays className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Set your exam date</p>
            <p className="text-sm text-muted-foreground">
              Get a countdown and a daily target to stay on pace.
            </p>
          </div>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="inline-flex flex-shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
        >
          <CalendarDays className="h-4 w-4" />
          Set date
        </button>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-5 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1.5">
          <label className="text-sm font-medium text-foreground">Exam date</label>
          <input
            type="date"
            min={today}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:max-w-xs"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => save(value || null)}
            disabled={isPending || !value}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save
          </button>
          <button
            onClick={() => {
              setValue(examDateIso ?? "");
              setEditing(false);
            }}
            disabled={isPending}
            className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Date is set → countdown + today's target.
  const exam = new Date(examDateIso + "T00:00:00Z");
  const left = daysUntil(exam);
  const target = computeDailyTarget(remainingLessons, dueReviews, left);

  return (
    <div className="space-y-4 rounded-2xl border border-border/40 bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
            <CalendarDays className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className={`text-sm font-bold ${target.overdue ? "text-np-red" : "text-foreground"}`}>
              {formatCountdown(left)}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(examDateIso + "T00:00:00Z").toLocaleDateString(undefined, {
                weekday: "short",
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: "UTC",
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setEditing(true)}
            aria-label="Change exam date"
            className="rounded-lg border border-border/60 p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <CalendarDays className="h-4 w-4" />
          </button>
          <button
            onClick={() => save(null)}
            disabled={isPending}
            aria-label="Clear exam date"
            className="rounded-lg border border-border/60 p-2 text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {remainingLessons === 0 && dueReviews === 0 ? (
        <p className="rounded-lg border border-np-success/30 bg-np-success/10 px-4 py-2.5 text-sm font-medium text-np-success">
          You&apos;re all caught up — keep reviewing to stay sharp before the day.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border/50 bg-background/40 px-4 py-3">
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              Lessons today
            </p>
            <p className="mt-1 text-2xl font-bold text-foreground">{target.lessonsPerDay}</p>
          </div>
          <div className="rounded-lg border border-border/50 bg-background/40 px-4 py-3">
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <RotateCcw className="h-3.5 w-3.5 text-np-orange" />
              Reviews due
            </p>
            <p className="mt-1 text-2xl font-bold text-foreground">{target.reviewsToday}</p>
          </div>
        </div>
      )}
      {target.overdue && remainingLessons > 0 && (
        <p className="flex items-center gap-1.5 text-xs text-np-red">
          <Target className="h-3.5 w-3.5" />
          Exam day is here — {remainingLessons} lessons still uncovered.
        </p>
      )}
    </div>
  );
}
