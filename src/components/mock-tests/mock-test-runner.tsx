"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlarmClock,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Flag,
  Loader2,
  PlayCircle,
  RotateCcw,
  Send,
  TimerIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { submitMockTest, type MockTestReview } from "@/lib/actions/ai-content";
import type { TakingQuestion } from "@/lib/data/mock-tests";
import { AttemptReview } from "@/components/mock-tests/attempt-review";

type Phase = "intro" | "running" | "submitting" | "done";

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Timed exam runner: countdown, question palette, flag-for-review, one-shot
 * server-side grading on submit (auto-submits when the clock hits zero).
 */
export function MockTestRunner({
  testId,
  title,
  durationMinutes,
  questions,
  backHref,
}: {
  testId: string;
  title: string;
  durationMinutes: number;
  questions: TakingQuestion[];
  backHref: string;
}) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    questions.map(() => null),
  );
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);
  const [confirming, setConfirming] = useState(false);
  const [review, setReview] = useState<MockTestReview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const submittingRef = useRef(false);

  const doSubmit = useCallback(
    async (current: (number | null)[]) => {
      if (submittingRef.current) return;
      submittingRef.current = true;
      setPhase("submitting");
      const res = await submitMockTest(testId, current);
      if (res.ok) {
        setReview(res.review);
        setPhase("done");
      } else {
        setError(res.error);
        setPhase("running");
        submittingRef.current = false;
      }
    },
    [testId],
  );

  // Countdown — auto-submit at zero.
  useEffect(() => {
    if (phase !== "running") return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          // Read the freshest answers via the setter to avoid stale closure.
          setAnswers((current) => {
            void doSubmit(current);
            return current;
          });
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase, doSubmit]);

  const answeredCount = answers.filter((a) => a !== null).length;
  const question = questions[index];

  // ─── Results ───
  if (phase === "done" && review) {
    return (
      <div className="space-y-6">
        <AttemptReview data={review} />
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => {
              submittingRef.current = false;
              setAnswers(questions.map(() => null));
              setFlagged(new Set());
              setIndex(0);
              setSecondsLeft(durationMinutes * 60);
              setReview(null);
              setError(null);
              setPhase("intro");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
          >
            <RotateCcw className="h-4 w-4" />
            Retake (no XP)
          </button>
          <Link
            href={backHref}
            className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            Back to mock tests
          </Link>
        </div>
      </div>
    );
  }

  // ─── Intro ───
  if (phase === "intro") {
    return (
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="mx-auto max-w-lg space-y-6 rounded-2xl border border-border/40 bg-card p-8 text-center"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <AlarmClock className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {questions.length} questions · {durationMinutes} minutes. The clock starts when you
            begin and the test auto-submits at zero. You can move freely between questions and
            flag any for review. XP is awarded on your first attempt.
          </p>
        </div>
        <button
          onClick={() => setPhase("running")}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
        >
          <PlayCircle className="h-5 w-5" />
          Start test
        </button>
      </motion.div>
    );
  }

  // ─── Running / submitting ───
  const low = secondsLeft <= 60;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* Sticky header: timer + progress */}
      <div className="sticky top-14 z-20 -mx-1 rounded-xl border border-border/50 bg-background/90 px-4 py-3 backdrop-blur sm:top-16">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{answeredCount}</span>/
            {questions.length} answered
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-bold tabular-nums",
              low
                ? "animate-pulse border-destructive/40 bg-destructive/10 text-destructive"
                : "border-primary/30 bg-primary/10 text-primary",
            )}
          >
            <TimerIcon className="h-4 w-4" />
            {fmt(secondsLeft)}
          </span>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Palette */}
      <div className="flex flex-wrap gap-1.5">
        {questions.map((q, i) => {
          const answered = answers[i] !== null;
          const isFlagged = flagged.has(i);
          return (
            <button
              key={q.id}
              onClick={() => setIndex(i)}
              className={cn(
                "relative h-9 w-9 rounded-lg border text-xs font-semibold transition-all active:scale-95",
                i === index && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                answered
                  ? "border-primary/50 bg-primary/15 text-primary"
                  : "border-border/60 bg-card text-muted-foreground hover:border-primary/40",
              )}
              aria-label={`Question ${i + 1}${answered ? ", answered" : ""}${isFlagged ? ", flagged" : ""}`}
            >
              {i + 1}
              {isFlagged && (
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-np-orange" />
              )}
            </button>
          );
        })}
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={question.id}
          initial={reduced ? false : { opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, x: -20 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="space-y-5 rounded-2xl border border-border/40 bg-card p-5 sm:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                {question.topic}
              </span>
              <span className="rounded-full border border-border/50 bg-secondary px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {question.difficulty}
              </span>
            </div>
            <button
              onClick={() =>
                setFlagged((f) => {
                  const next = new Set(f);
                  if (next.has(index)) next.delete(index);
                  else next.add(index);
                  return next;
                })
              }
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all active:scale-95",
                flagged.has(index)
                  ? "border-np-orange/50 bg-np-orange/15 text-np-orange"
                  : "border-border/60 text-muted-foreground hover:border-np-orange/40 hover:text-np-orange",
              )}
            >
              <Flag className="h-3.5 w-3.5" />
              {flagged.has(index) ? "Flagged" : "Flag"}
            </button>
          </div>

          <h2 className="text-base font-semibold leading-relaxed text-foreground sm:text-lg">
            <span className="mr-2 text-muted-foreground">Q{index + 1}.</span>
            {question.text}
          </h2>

          <div className="space-y-2.5">
            {question.options.map((option, i) => {
              const selected = answers[index] === i;
              return (
                <button
                  key={i}
                  onClick={() =>
                    setAnswers((a) => {
                      const next = [...a];
                      next[index] = selected ? null : i;
                      return next;
                    })
                  }
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all active:scale-[0.995]",
                    selected
                      ? "border-primary bg-primary/10"
                      : "border-border/60 bg-background hover:border-primary/40 hover:bg-secondary/50",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                      selected ? "border-primary text-primary" : "border-border text-muted-foreground",
                    )}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1">{option}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Nav + submit */}
      <div className="flex items-center justify-between gap-3 pb-4">
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {confirming ? (
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-muted-foreground sm:inline">
              {questions.length - answeredCount > 0
                ? `${questions.length - answeredCount} unanswered —`
                : "All answered —"}{" "}
              submit?
            </span>
            <button
              onClick={() => setConfirming(false)}
              className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Keep going
            </button>
            <button
              onClick={() => void doSubmit(answers)}
              disabled={phase === "submitting"}
              className="inline-flex items-center gap-2 rounded-lg bg-np-success px-4 py-2.5 text-sm font-semibold text-background transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
            >
              {phase === "submitting" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Confirm
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            disabled={phase === "submitting"}
            className="inline-flex items-center gap-2 rounded-lg border border-np-success/40 bg-np-success/10 px-4 py-2.5 text-sm font-semibold text-np-success transition-all hover:bg-np-success/20 active:scale-[0.98] disabled:opacity-60"
          >
            {phase === "submitting" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Submit test
          </button>
        )}

        <button
          onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
          disabled={index === questions.length - 1}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
        >
          <span className="hidden sm:inline">Next</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
