"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RotateCcw, Sparkles, Zap, MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";
import { reviewCard } from "@/lib/actions/flashcards";
import {
  scheduleNext,
  formatInterval,
  INITIAL_SRS,
  type ReviewGrade,
} from "@/lib/srs";
import type { StudyCard } from "@/lib/data/flashcards";

const GRADES: { grade: ReviewGrade; label: string; cls: string }[] = [
  { grade: "again", label: "Again", cls: "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20" },
  { grade: "hard", label: "Hard", cls: "border-np-orange/40 bg-np-orange/10 text-np-orange hover:bg-np-orange/20" },
  { grade: "good", label: "Good", cls: "border-primary/40 bg-primary/10 text-primary hover:bg-primary/20" },
  { grade: "easy", label: "Easy", cls: "border-np-success/40 bg-np-success/10 text-np-success hover:bg-np-success/20" },
];

export function FlashcardDeck({
  cards,
  backHref,
}: {
  cards: StudyCard[];
  backHref: string;
}) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [xp, setXp] = useState(0);
  const [finished, setFinished] = useState(false);

  if (cards.length === 0) {
    return (
      <div className="rounded-2xl border border-border/40 bg-card p-10 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-np-success/10">
          <Sparkles className="h-7 w-7 text-np-success" />
        </div>
        <p className="font-medium text-foreground">All caught up!</p>
        <p className="mt-1 text-sm text-muted-foreground">
          No cards are due right now. Spaced repetition will resurface them when it&apos;s time.
        </p>
        <Link
          href={backHref}
          className="mt-4 inline-flex rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Back
        </Link>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="mx-auto max-w-lg space-y-6 rounded-2xl border border-border/40 bg-card p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-8 w-8 text-np-orange" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Session complete!</h2>
          <p className="mt-1 text-muted-foreground">
            You reviewed {reviewed} card{reviewed === 1 ? "" : "s"}. They&apos;re scheduled for their
            next review.
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 text-np-xp">
          <Zap className="h-5 w-5" />
          <span className="text-lg font-semibold">+{xp} XP earned</span>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => router.refresh()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
          >
            <RotateCcw className="h-4 w-4" />
            Study more
          </button>
          <Link
            href={backHref}
            className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            Done
          </Link>
        </div>
      </div>
    );
  }

  const card = cards[index];
  const baseState = card.state ?? INITIAL_SRS;
  const progress = (index / cards.length) * 100;

  const handleGrade = (grade: ReviewGrade) => {
    reviewCard(card.id, grade)
      .then((r) => setXp((x) => x + r.xpAwarded))
      .catch(() => {});
    setReviewed((n) => n + 1);

    if (index === cards.length - 1) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setFlipped(false);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Card {index + 1} of {cards.length}
          </span>
          <span className="flex items-center gap-1.5">
            {card.isNew ? (
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase text-primary">
                New
              </span>
            ) : (
              <span className="rounded-full border border-np-orange/20 bg-np-orange/10 px-2 py-0.5 text-[10px] font-medium uppercase text-np-orange">
                Review
              </span>
            )}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Flip card */}
      <button
        onClick={() => setFlipped((f) => !f)}
        className="group block w-full [perspective:1200px]"
        aria-label="Flip card"
      >
        <div
          className={cn(
            "relative min-h-[16rem] w-full transition-transform duration-500 [transform-style:preserve-3d]",
            flipped && "[transform:rotateY(180deg)]",
          )}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl border border-border/60 bg-card p-8 text-center [backface-visibility:hidden]">
            <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
              {card.topic}
            </span>
            <p className="text-xl font-semibold text-foreground">{card.front}</p>
            <span className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <MousePointerClick className="h-3.5 w-3.5" />
              Click to flip
            </span>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl border border-primary/40 bg-primary/5 p-8 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <span className="text-[10px] font-medium uppercase tracking-wide text-primary">Answer</span>
            <p className="text-lg font-medium leading-relaxed text-foreground">{card.back}</p>
          </div>
        </div>
      </button>

      {/* Grade buttons (after flip) with projected intervals */}
      {flipped ? (
        <div className="grid grid-cols-4 gap-2">
          {GRADES.map(({ grade, label, cls }) => {
            const projected = scheduleNext(baseState, grade).interval;
            return (
              <button
                key={grade}
                onClick={() => handleGrade(grade)}
                className={cn("flex flex-col items-center gap-0.5 rounded-lg border py-2.5 text-sm font-semibold transition-all", cls)}
              >
                {label}
                <span className="text-[10px] font-normal opacity-80">{formatInterval(projected)}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <button
          onClick={() => setFlipped(true)}
          className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
        >
          Show answer
        </button>
      )}
    </div>
  );
}
