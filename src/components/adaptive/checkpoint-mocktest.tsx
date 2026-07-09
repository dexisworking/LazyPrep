"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Trophy,
  RotateCcw,
  ArrowRight,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { submitCheckpoint } from "@/lib/actions/checkpoint";
import type { CheckpointQuizQuestion } from "@/lib/data/adaptive";

type SubmitResult = {
  score: number;
  passed: boolean;
  threshold: number;
  correct: number;
  total: number;
  results: {
    questionId: string;
    selectedIdx: number;
    correct: boolean;
    correctIdx: number;
    explanation: string;
  }[];
  unlockedNext: boolean;
  hasNextPhase: boolean;
};

export function CheckpointMocktest({
  moduleId,
  courseSlug,
  phaseTitle,
  threshold,
  questions,
}: {
  moduleId: string;
  courseSlug: string;
  phaseTitle: string;
  threshold: number;
  questions: CheckpointQuizQuestion[];
}) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;

  const handleSubmit = () => {
    setError("");
    startTransition(async () => {
      const payload = questions.map((q) => ({
        questionId: q.id,
        selectedIdx: answers[q.id] ?? -1,
      }));
      const res = await submitCheckpoint(moduleId, payload);
      if (res.ok) {
        setResult(res);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setError(res.error ?? "Something went wrong.");
      }
    });
  };

  const retake = () => {
    setAnswers({});
    setResult(null);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resultByQ = new Map(result?.results.map((r) => [r.questionId, r]) ?? []);

  return (
    <div className="space-y-6">
      {/* Result banner */}
      {result && (
        <div
          className={cn(
            "rounded-2xl border p-6 text-center",
            result.passed
              ? "border-np-success/40 bg-np-success/5"
              : "border-destructive/40 bg-destructive/5",
          )}
        >
          <div
            className={cn(
              "mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full",
              result.passed ? "bg-np-success/10" : "bg-destructive/10",
            )}
          >
            {result.passed ? (
              <Trophy className="h-8 w-8 text-np-success" />
            ) : (
              <Target className="h-8 w-8 text-destructive" />
            )}
          </div>
          <p className="text-3xl font-bold text-foreground">{result.score}%</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.correct} of {result.total} correct · need {result.threshold}% to pass
          </p>
          {result.passed ? (
            <div className="mt-4 space-y-3">
              <p className="font-semibold text-np-success">
                {phaseTitle} mastered! 🎉{" "}
                {result.hasNextPhase ? "The next phase is unlocked." : "You've completed the course!"}
              </p>
              <Link
                href={`/courses/${courseSlug}`}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
              >
                {result.hasNextPhase ? "Continue to next phase" : "Back to course"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="mt-4">
              <p className="mb-3 text-sm text-muted-foreground">
                So close — review the answers below, then retake.
              </p>
              <button
                onClick={retake}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
              >
                <RotateCcw className="h-4 w-4" />
                Retake checkpoint
              </button>
            </div>
          )}
        </div>
      )}

      {!result && (
        <div className="rounded-xl border border-border/50 bg-card p-4 text-sm text-muted-foreground">
          Answer all {questions.length} questions. Score{" "}
          <span className="font-semibold text-foreground">{threshold}%+</span> to master{" "}
          <span className="font-semibold text-foreground">{phaseTitle}</span> and unlock the next phase.
        </div>
      )}

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((q, qi) => {
          const r = resultByQ.get(q.id);
          const selected = answers[q.id];

          return (
            <div key={q.id} className="space-y-3 rounded-2xl border border-border/40 bg-card p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-muted-foreground">
                  {qi + 1}
                </span>
                <p className="font-medium text-foreground">{q.text}</p>
              </div>

              <div className="space-y-2 pl-9">
                {q.options.map((opt, oi) => {
                  const isChosen = selected === oi;
                  // After grading:
                  const isCorrect = r && oi === r.correctIdx;
                  const isWrongPick = r && oi === r.selectedIdx && !r.correct;

                  return (
                    <button
                      key={oi}
                      disabled={!!result || isPending}
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-all",
                        !r && isChosen && "border-primary bg-primary/10",
                        !r && !isChosen && "border-border/60 bg-background hover:border-primary/40",
                        isCorrect && "border-np-success bg-np-success/10",
                        isWrongPick && "border-destructive bg-destructive/10",
                        r && !isCorrect && !isWrongPick && "border-border/40 opacity-60",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold",
                          !r && isChosen && "border-primary text-primary",
                          !r && !isChosen && "border-border text-muted-foreground",
                          isCorrect && "border-np-success text-np-success",
                          isWrongPick && "border-destructive text-destructive",
                        )}
                      >
                        {isCorrect ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : isWrongPick ? (
                          <XCircle className="h-3.5 w-3.5" />
                        ) : (
                          String.fromCharCode(65 + oi)
                        )}
                      </span>
                      <span className="flex-1">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {r && (
                <p className="ml-9 rounded-lg border border-border/40 bg-secondary/40 p-3 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Why: </span>
                  {r.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit */}
      {!result && (
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">
            {answeredCount} / {questions.length} answered
          </span>
          <div className="flex flex-col items-end gap-1">
            {error && <span className="text-xs text-destructive">{error}</span>}
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit checkpoint
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
