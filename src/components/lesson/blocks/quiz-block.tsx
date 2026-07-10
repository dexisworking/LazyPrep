"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, XCircle, HelpCircle, RotateCcw, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export type QuizBlockData = {
  question: string;
  options: string[];
  answer: number;
  explanation?: string;
};

/**
 * Inline "check your understanding" MCQ inside a lesson. Purely formative —
 * grades locally, awards no XP, and can be retried freely.
 */
export function QuizBlock({ data }: { data: QuizBlockData }) {
  const reduced = useReducedMotion();
  const [picked, setPicked] = useState<number | null>(null);
  const [shakeKey, setShakeKey] = useState(0);

  const answered = picked !== null;
  const correct = answered && picked === data.answer;

  const handlePick = (i: number) => {
    if (answered) return;
    setPicked(i);
    if (i !== data.answer) setShakeKey((k) => k + 1);
  };

  return (
    <motion.div
      key={shakeKey}
      animate={
        shakeKey > 0 && !reduced ? { x: [0, -7, 7, -5, 5, 0] } : { x: 0 }
      }
      transition={{ duration: 0.35 }}
      className="np-block my-6 rounded-xl border border-primary/25 bg-primary/[0.04] p-4 sm:p-5"
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15">
          <HelpCircle className="h-3.5 w-3.5 text-primary" />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
          Quick check
        </span>
      </div>

      <p className="mb-4 font-semibold leading-relaxed text-foreground">{data.question}</p>

      <div className="space-y-2">
        {data.options.map((option, i) => {
          const isPick = picked === i;
          const isAnswer = answered && i === data.answer;
          const isWrongPick = isPick && !correct;
          return (
            <button
              key={i}
              type="button"
              disabled={answered}
              onClick={() => handlePick(i)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border px-3.5 py-2.5 text-left text-sm transition-all",
                !answered &&
                  "border-border/60 bg-background hover:border-primary/50 hover:bg-primary/5 active:scale-[0.99]",
                isAnswer && "border-np-success bg-np-success/10",
                isWrongPick && "border-destructive bg-destructive/10",
                answered && !isAnswer && !isWrongPick && "border-border/40 opacity-55",
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                  !answered && "border-border text-muted-foreground",
                  isAnswer && "border-np-success text-np-success",
                  isWrongPick && "border-destructive text-destructive",
                  answered && !isAnswer && !isWrongPick && "border-border text-muted-foreground",
                )}
              >
                {isAnswer ? (
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

      {answered && (
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={cn(
            "mt-4 rounded-lg border p-3.5 text-sm",
            correct
              ? "border-np-success/30 bg-np-success/5"
              : "border-destructive/30 bg-destructive/5",
          )}
        >
          <div className="mb-1 flex items-center justify-between gap-2">
            {correct ? (
              <span className="flex items-center gap-1.5 font-semibold text-np-success">
                <Zap className="h-4 w-4" /> Nailed it!
              </span>
            ) : (
              <span className="flex items-center gap-1.5 font-semibold text-destructive">
                <XCircle className="h-4 w-4" /> Not quite
              </span>
            )}
            <button
              type="button"
              onClick={() => setPicked(null)}
              className="inline-flex items-center gap-1 rounded-md border border-border/60 px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3" />
              Retry
            </button>
          </div>
          {data.explanation && <p className="text-muted-foreground">{data.explanation}</p>}
        </motion.div>
      )}
    </motion.div>
  );
}
