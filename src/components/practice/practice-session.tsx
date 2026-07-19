"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Zap,
  ArrowRight,
  RotateCcw,
  BookOpenCheck,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { submitAnswer } from "@/lib/actions/practice";
import type { QuizQuestion } from "@/lib/data/practice";

type Feedback = {
  correct: boolean;
  correctIdx: number;
  explanation: string;
  xpAwarded: number;
};

export function PracticeSession({
  questions,
  notebookHref,
}: {
  questions: QuizQuestion[];
  notebookHref: string;
}) {
  const router = useRouter();
  const reduced = useReducedMotion();
  // Snapshot the deck for the whole session. `submitAnswer` revalidates
  // paths, which re-runs the page and reshuffles `questions` mid-session —
  // without this freeze, the visible question changes underneath feedback
  // state that still belongs to the answered one (wrong explanation, and the
  // green highlight lands on an arbitrary option). The fresh prop is adopted
  // only on an explicit restart.
  const [deck, setDeck] = useState(questions);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [xpTotal, setXpTotal] = useState(0);
  const [finished, setFinished] = useState(false);
  const [isPending, startTransition] = useTransition();

  const question = deck[index];
  const isLast = index === deck.length - 1;

  if (deck.length === 0) {
    return (
      <div className="rounded-xl border border-border/50 bg-card p-10 text-center text-muted-foreground">
        No practice questions available for this course yet.
      </div>
    );
  }

  const handleRestart = () => {
    // Adopt the latest server-provided deck (revalidations during the session
    // have already refreshed the prop), then ask for an even fresher one.
    setDeck(questions);
    setIndex(0);
    setSelected(null);
    setFeedback(null);
    setCorrectCount(0);
    setXpTotal(0);
    setFinished(false);
    router.refresh();
  };

  if (finished) {
    const pct = Math.round((correctCount / deck.length) * 100);
    return (
      <div className="mx-auto max-w-lg space-y-6 rounded-2xl border border-border/40 bg-card p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Trophy className="h-8 w-8 text-np-orange" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Session complete!</h2>
          <p className="mt-1 text-muted-foreground">
            You scored {correctCount} / {deck.length} ({pct}%)
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 text-np-xp">
          <Zap className="h-5 w-5" />
          <span className="text-lg font-semibold">+{xpTotal} XP earned</span>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={handleRestart}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
          >
            <RotateCcw className="h-4 w-4" />
            Practice again
          </button>
          <Link
            href={notebookHref}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            <BookOpenCheck className="h-4 w-4" />
            Review mistakes
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = () => {
    if (selected === null) return;
    startTransition(async () => {
      const result = await submitAnswer(question.id, selected);
      setFeedback(result);
      if (result.correct) setCorrectCount((c) => c + 1);
      setXpTotal((x) => x + result.xpAwarded);
    });
  };

  const handleNext = () => {
    if (isLast) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setFeedback(null);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Question {index + 1} of {deck.length}
          </span>
          <span className="flex items-center gap-1 font-medium text-np-success">
            <CheckCircle2 className="h-4 w-4" />
            {correctCount} correct
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${((index + (feedback ? 1 : 0)) / deck.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={question.id}
        initial={reduced ? false : { opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={reduced ? { opacity: 0 } : { opacity: 0, x: -24 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="space-y-5 rounded-2xl border border-border/40 bg-card p-6"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
            {question.topic}
          </span>
          <span className="rounded-full border border-border/50 bg-secondary px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {question.difficulty}
          </span>
        </div>

        <h2 className="text-lg font-semibold leading-relaxed text-foreground">{question.text}</h2>

        <div className="space-y-2.5">
          {question.options.map((option, i) => {
            const isSelected = selected === i;
            const isCorrect = feedback && i === feedback.correctIdx;
            const isWrongPick = feedback && isSelected && !feedback.correct;

            return (
              <button
                key={i}
                disabled={!!feedback || isPending}
                onClick={() => setSelected(i)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all",
                  !feedback && isSelected && "border-primary bg-primary/10",
                  !feedback && !isSelected && "border-border/60 bg-background hover:border-primary/40 hover:bg-secondary/50",
                  isCorrect && "border-np-success bg-np-success/10 text-foreground",
                  isWrongPick && "border-destructive bg-destructive/10 text-foreground",
                  feedback && !isCorrect && !isWrongPick && "border-border/40 opacity-60",
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                    !feedback && isSelected && "border-primary text-primary",
                    !feedback && !isSelected && "border-border text-muted-foreground",
                    isCorrect && "border-np-success text-np-success",
                    isWrongPick && "border-destructive text-destructive",
                  )}
                >
                  {isCorrect ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : isWrongPick ? (
                    <XCircle className="h-4 w-4" />
                  ) : (
                    String.fromCharCode(65 + i)
                  )}
                </span>
                <span className="flex-1">{option}</span>
              </button>
            );
          })}
        </div>

        {/* Explanation after answering */}
        {feedback && (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className={cn(
              "rounded-lg border p-4 text-sm",
              feedback.correct
                ? "border-np-success/30 bg-np-success/5"
                : "border-destructive/30 bg-destructive/5",
            )}
          >
            <div className="mb-1 flex items-center gap-2 font-semibold">
              {feedback.correct ? (
                <span className="flex items-center gap-1.5 text-np-success">
                  <CheckCircle2 className="h-4 w-4" /> Correct
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-destructive">
                  <XCircle className="h-4 w-4" /> Not quite
                </span>
              )}
              <span className="flex items-center gap-1 text-xs font-medium text-np-xp">
                <Zap className="h-3.5 w-3.5" />+{feedback.xpAwarded} XP
              </span>
            </div>
            <p className="text-muted-foreground">{feedback.explanation}</p>
          </motion.div>
        )}
      </motion.div>
      </AnimatePresence>

      {/* Action */}
      <div className="flex justify-end">
        {feedback ? (
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
          >
            {isLast ? "See results" : "Next question"}
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={selected === null || isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit answer
          </button>
        )}
      </div>
    </div>
  );
}
