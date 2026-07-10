"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, XCircle, ListOrdered, RotateCcw, PartyPopper } from "lucide-react";
import { cn, shuffle } from "@/lib/utils";

export type SortBlockData = {
  prompt?: string;
  /** Items listed in the CORRECT order — the component shuffles them. */
  items: string[];
};

type Verdict = "unchecked" | "correct" | "wrong";

/**
 * Duolingo-style "put these in order" exercise. Tap chips from the pool to
 * build the sequence; tap a placed item to send it back. Grades locally.
 */
export function SortBlock({ data }: { data: SortBlockData }) {
  const reduced = useReducedMotion();
  // Shuffle only after mount so the server render matches the first client render.
  const [pool, setPool] = useState<number[] | null>(null);
  const [placed, setPlaced] = useState<number[]>([]);
  const [verdict, setVerdict] = useState<Verdict>("unchecked");

  useEffect(() => {
    setPool(shuffle(data.items.map((_, i) => i)));
  }, [data.items]);

  const reset = () => {
    setPool(shuffle(data.items.map((_, i) => i)));
    setPlaced([]);
    setVerdict("unchecked");
  };

  const place = (idx: number) => {
    if (verdict !== "unchecked") return;
    setPool((p) => (p ? p.filter((i) => i !== idx) : p));
    setPlaced((p) => [...p, idx]);
  };

  const unplace = (idx: number) => {
    if (verdict !== "unchecked") return;
    setPlaced((p) => p.filter((i) => i !== idx));
    setPool((p) => (p ? [...p, idx] : p));
  };

  const check = () => {
    const ok = placed.every((itemIdx, pos) => itemIdx === pos);
    setVerdict(ok ? "correct" : "wrong");
  };

  const done = placed.length === data.items.length;

  return (
    <div className="np-block my-6 rounded-xl border border-np-orange/25 bg-np-orange/[0.04] p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-np-orange/15">
          <ListOrdered className="h-3.5 w-3.5 text-np-orange" />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-np-orange">
          Put in order
        </span>
      </div>

      {data.prompt && (
        <p className="mb-4 font-semibold leading-relaxed text-foreground">{data.prompt}</p>
      )}

      {/* Answer slots */}
      <ol className="mb-4 space-y-2">
        {placed.map((itemIdx, pos) => {
          const isRight = verdict !== "unchecked" && itemIdx === pos;
          const isWrong = verdict !== "unchecked" && itemIdx !== pos;
          return (
            <motion.li
              key={itemIdx}
              layout={!reduced}
              initial={reduced ? false : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <button
                type="button"
                onClick={() => unplace(itemIdx)}
                disabled={verdict !== "unchecked"}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border px-3.5 py-2.5 text-left text-sm transition-all",
                  verdict === "unchecked" &&
                    "border-np-orange/40 bg-background hover:border-destructive/50 active:scale-[0.99]",
                  isRight && "border-np-success bg-np-success/10",
                  isWrong && "border-destructive bg-destructive/10",
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                    verdict === "unchecked" && "border-np-orange/50 text-np-orange",
                    isRight && "border-np-success text-np-success",
                    isWrong && "border-destructive text-destructive",
                  )}
                >
                  {isRight ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : isWrong ? (
                    <XCircle className="h-4 w-4" />
                  ) : (
                    pos + 1
                  )}
                </span>
                <span className="flex-1">{data.items[itemIdx]}</span>
              </button>
            </motion.li>
          );
        })}
        {placed.length < data.items.length && (
          <li className="rounded-lg border border-dashed border-border/70 px-3.5 py-2.5 text-sm text-muted-foreground">
            Tap an item below to place it {placed.length === 0 ? "first" : "next"}…
          </li>
        )}
      </ol>

      {/* Pool */}
      <div className="flex flex-wrap gap-2">
        <AnimatePresence initial={false}>
          {(pool ?? data.items.map((_, i) => i)).map((itemIdx) => (
            <motion.button
              key={itemIdx}
              type="button"
              layout={!reduced}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              onClick={() => place(itemIdx)}
              disabled={pool === null}
              className="rounded-lg border border-border/70 bg-card px-3 py-2 text-sm text-foreground shadow-sm transition-all hover:border-np-orange/50 hover:bg-np-orange/5 active:scale-[0.97]"
            >
              {data.items[itemIdx]}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Actions / verdict */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {verdict === "unchecked" ? (
          <button
            type="button"
            onClick={check}
            disabled={!done}
            className="inline-flex items-center gap-2 rounded-lg bg-np-orange px-4 py-2 text-sm font-semibold text-background transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
          >
            Check order
          </button>
        ) : (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary active:scale-[0.98]"
          >
            <RotateCcw className="h-4 w-4" />
            {verdict === "correct" ? "Do it again" : "Try again"}
          </button>
        )}
        {verdict === "correct" && (
          <motion.span
            initial={reduced ? false : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-np-success"
          >
            <PartyPopper className="h-4 w-4" /> Perfect sequence!
          </motion.span>
        )}
        {verdict === "wrong" && (
          <span className="text-sm font-medium text-destructive">
            Some items are misplaced — the red ones are in the wrong spot.
          </span>
        )}
      </div>
    </div>
  );
}
