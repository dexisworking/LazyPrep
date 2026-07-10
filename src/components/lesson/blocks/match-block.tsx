"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link2, PartyPopper, RotateCcw } from "lucide-react";
import { cn, shuffle } from "@/lib/utils";

export type MatchBlockData = {
  prompt?: string;
  pairs: { left: string; right: string }[];
};

/**
 * Duolingo-style pair matching. Tap one item in each column: correct pairs
 * lock in green, wrong picks shake and clear. Grades locally.
 */
export function MatchBlock({ data }: { data: MatchBlockData }) {
  const reduced = useReducedMotion();
  // Column orders are shuffled after mount (avoids SSR/client hydration mismatch).
  const [leftOrder, setLeftOrder] = useState<number[] | null>(null);
  const [rightOrder, setRightOrder] = useState<number[] | null>(null);
  const [pickedLeft, setPickedLeft] = useState<number | null>(null);
  const [pickedRight, setPickedRight] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrongPair, setWrongPair] = useState<[number, number] | null>(null);
  const [misses, setMisses] = useState(0);

  const indices = data.pairs.map((_, i) => i);

  useEffect(() => {
    setLeftOrder(shuffle(data.pairs.map((_, i) => i)));
    setRightOrder(shuffle(data.pairs.map((_, i) => i)));
  }, [data.pairs]);

  const reset = () => {
    setLeftOrder(shuffle(data.pairs.map((_, i) => i)));
    setRightOrder(shuffle(data.pairs.map((_, i) => i)));
    setPickedLeft(null);
    setPickedRight(null);
    setMatched(new Set());
    setWrongPair(null);
    setMisses(0);
  };

  const tryMatch = (left: number | null, right: number | null) => {
    if (left === null || right === null) return;
    if (left === right) {
      setMatched((m) => new Set(m).add(left));
      setPickedLeft(null);
      setPickedRight(null);
    } else {
      setWrongPair([left, right]);
      setMisses((n) => n + 1);
      // Clear the wrong selection after the shake plays.
      window.setTimeout(() => {
        setWrongPair(null);
        setPickedLeft(null);
        setPickedRight(null);
      }, 450);
    }
  };

  const pickLeft = (i: number) => {
    if (matched.has(i) || wrongPair) return;
    setPickedLeft(i);
    tryMatch(i, pickedRight);
  };
  const pickRight = (i: number) => {
    if (matched.has(i) || wrongPair) return;
    setPickedRight(i);
    tryMatch(pickedLeft, i);
  };

  const complete = matched.size === data.pairs.length;

  const chipCls = (i: number, side: "L" | "R") => {
    const picked = side === "L" ? pickedLeft === i : pickedRight === i;
    const isWrong = wrongPair !== null && (side === "L" ? wrongPair[0] === i : wrongPair[1] === i);
    return cn(
      "w-full rounded-lg border px-3 py-2.5 text-left text-sm transition-all",
      matched.has(i)
        ? "border-np-success/60 bg-np-success/10 text-muted-foreground opacity-70"
        : isWrong
          ? "border-destructive bg-destructive/10"
          : picked
            ? "border-primary bg-primary/10"
            : "border-border/70 bg-card hover:border-primary/50 hover:bg-primary/5 active:scale-[0.98]",
    );
  };

  const shakeAnim = (i: number, side: "L" | "R") =>
    !reduced && wrongPair !== null && (side === "L" ? wrongPair[0] === i : wrongPair[1] === i)
      ? { x: [0, -6, 6, -4, 4, 0] }
      : {};

  return (
    <div className="np-block my-6 rounded-xl border border-np-success/25 bg-np-success/[0.04] p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-np-success/15">
          <Link2 className="h-3.5 w-3.5 text-np-success" />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-np-success">
          Match the pairs
        </span>
      </div>

      {data.prompt && (
        <p className="mb-4 font-semibold leading-relaxed text-foreground">{data.prompt}</p>
      )}

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <div className="space-y-2">
          {(leftOrder ?? indices).map((i) => (
            <motion.button
              key={`L${i}`}
              type="button"
              animate={shakeAnim(i, "L")}
              transition={{ duration: 0.35 }}
              onClick={() => pickLeft(i)}
              disabled={matched.has(i) || leftOrder === null}
              className={chipCls(i, "L")}
            >
              {data.pairs[i].left}
            </motion.button>
          ))}
        </div>
        <div className="space-y-2">
          {(rightOrder ?? indices).map((i) => (
            <motion.button
              key={`R${i}`}
              type="button"
              animate={shakeAnim(i, "R")}
              transition={{ duration: 0.35 }}
              onClick={() => pickRight(i)}
              disabled={matched.has(i) || rightOrder === null}
              className={chipCls(i, "R")}
            >
              {data.pairs[i].right}
            </motion.button>
          ))}
        </div>
      </div>

      {complete && (
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 350, damping: 22 }}
          className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-np-success/30 bg-np-success/10 px-4 py-3"
        >
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-np-success">
            <PartyPopper className="h-4 w-4" />
            All matched{misses === 0 ? " — flawless!" : `! (${misses} miss${misses === 1 ? "" : "es"})`}
          </span>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-card px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <RotateCcw className="h-3 w-3" />
            Shuffle & replay
          </button>
        </motion.div>
      )}
    </div>
  );
}
