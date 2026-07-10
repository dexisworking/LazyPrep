"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, XCircle, MinusCircle, Zap, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type ReviewQuestion = {
  order: number;
  text: string;
  options: string[];
  topic: string;
  difficulty: string;
  correctIdx: number;
  explanation: string;
  selectedIdx: number | null;
};

export type ReviewData = {
  score: number;
  correct: number;
  total: number;
  xpAwarded?: number;
  topics: { topic: string; correct: number; total: number }[];
  questions: ReviewQuestion[];
};

function scoreTone(score: number) {
  if (score >= 80) return { text: "text-np-success", stroke: "var(--np-success)", label: "Excellent!" };
  if (score >= 60) return { text: "text-np-orange", stroke: "var(--np-orange)", label: "Getting there" };
  return { text: "text-destructive", stroke: "var(--destructive)", label: "Keep practicing" };
}

/** Animated SVG score ring. */
function ScoreRing({ score }: { score: number }) {
  const reduced = useReducedMotion();
  const tone = scoreTone(score);
  const r = 52;
  const c = 2 * Math.PI * r;

  return (
    <div className="relative h-36 w-36">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--secondary)" strokeWidth="10" />
        <motion.circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={tone.stroke}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: reduced ? c * (1 - score / 100) : c }}
          animate={{ strokeDashoffset: c * (1 - score / 100) }}
          transition={{ duration: reduced ? 0 : 1, ease: "easeOut", delay: 0.15 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-3xl font-bold", tone.text)}>{score}%</span>
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          score
        </span>
      </div>
    </div>
  );
}

/** Full attempt breakdown: score ring, stats, per-topic bars, answer review. */
export function AttemptReview({ data }: { data: ReviewData }) {
  const reduced = useReducedMotion();
  const tone = scoreTone(data.score);
  const [openQ, setOpenQ] = useState<number | null>(null);
  const skipped = data.questions.filter((q) => q.selectedIdx === null).length;

  return (
    <div className="space-y-6">
      {/* Summary card */}
      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="flex flex-col items-center gap-5 rounded-2xl border border-border/40 bg-card p-6 sm:flex-row sm:justify-center sm:gap-10 sm:p-8"
      >
        <ScoreRing score={data.score} />
        <div className="space-y-2.5 text-center sm:text-left">
          <p className={cn("text-xl font-bold", tone.text)}>{tone.label}</p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-np-success/30 bg-np-success/10 px-2.5 py-1 text-xs font-medium text-np-success">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {data.correct} correct
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
              <XCircle className="h-3.5 w-3.5" />
              {data.total - data.correct - skipped} wrong
            </span>
            {skipped > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
                <MinusCircle className="h-3.5 w-3.5" />
                {skipped} skipped
              </span>
            )}
          </div>
          {typeof data.xpAwarded === "number" && data.xpAwarded > 0 && (
            <p className="flex items-center justify-center gap-1.5 text-sm font-semibold text-np-xp sm:justify-start">
              <Zap className="h-4 w-4" />+{data.xpAwarded} XP earned
            </p>
          )}
        </div>
      </motion.div>

      {/* Topic breakdown */}
      {data.topics.length > 1 && (
        <div className="rounded-2xl border border-border/40 bg-card p-5 sm:p-6">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Topic breakdown
          </h3>
          <div className="space-y-3">
            {[...data.topics]
              .sort((a, b) => a.correct / a.total - b.correct / b.total)
              .map((t, i) => {
                const pct = Math.round((t.correct / t.total) * 100);
                const barTone =
                  pct >= 80 ? "bg-np-success" : pct >= 50 ? "bg-np-orange" : "bg-destructive";
                return (
                  <div key={t.topic}>
                    <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                      <span className="truncate font-medium text-foreground">{t.topic}</span>
                      <span className="flex-shrink-0 text-xs text-muted-foreground">
                        {t.correct}/{t.total}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <motion.div
                        initial={{ width: reduced ? `${pct}%` : 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: 0.1 + i * 0.05, ease: "easeOut" }}
                        className={cn("h-full rounded-full", barTone)}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Answer review */}
      <div className="space-y-2.5">
        <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Answer review
        </h3>
        {data.questions.map((q) => {
          const isCorrect = q.selectedIdx === q.correctIdx;
          const isSkipped = q.selectedIdx === null;
          const isOpen = openQ === q.order;
          return (
            <div
              key={q.order}
              className={cn(
                "overflow-hidden rounded-xl border bg-card transition-colors",
                isCorrect
                  ? "border-np-success/25"
                  : isSkipped
                    ? "border-border/50"
                    : "border-destructive/25",
              )}
            >
              <button
                type="button"
                onClick={() => setOpenQ(isOpen ? null : q.order)}
                className="flex w-full items-center gap-3 p-4 text-left"
              >
                <span
                  className={cn(
                    "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    isCorrect
                      ? "bg-np-success/15 text-np-success"
                      : isSkipped
                        ? "bg-secondary text-muted-foreground"
                        : "bg-destructive/15 text-destructive",
                  )}
                >
                  {q.order}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {q.text}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {q.topic} · {q.difficulty}
                    {isSkipped && " · skipped"}
                  </span>
                </span>
                {isCorrect ? (
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-np-success" />
                ) : isSkipped ? (
                  <MinusCircle className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                ) : (
                  <XCircle className="h-5 w-5 flex-shrink-0 text-destructive" />
                )}
                <ChevronDown
                  className={cn(
                    "h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform",
                    isOpen && "rotate-180",
                  )}
                />
              </button>
              {isOpen && (
                <div className="space-y-2 border-t border-border/40 p-4">
                  {q.options.map((option, i) => {
                    const correctOpt = i === q.correctIdx;
                    const picked = i === q.selectedIdx;
                    return (
                      <div
                        key={i}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm",
                          correctOpt && "border-np-success/50 bg-np-success/10",
                          picked && !correctOpt && "border-destructive/50 bg-destructive/10",
                          !correctOpt && !picked && "border-border/40 opacity-70",
                        )}
                      >
                        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-current/30 text-[10px] font-semibold text-muted-foreground">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="flex-1 text-foreground">{option}</span>
                        {correctOpt && <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-np-success" />}
                        {picked && !correctOpt && <XCircle className="h-4 w-4 flex-shrink-0 text-destructive" />}
                      </div>
                    );
                  })}
                  {q.explanation && (
                    <p className="rounded-lg bg-secondary/60 p-3 text-sm leading-relaxed text-muted-foreground">
                      {q.explanation}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
