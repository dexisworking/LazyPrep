"use client";

/**
 * Shimmering status line for long AI waits.
 *
 * Adapted from the kokonutui "AI Text Loading" pattern, retuned for LazyPrep:
 * the gradient is built from `--foreground` / `--muted-foreground` rather than
 * hard-coded neutrals, so it reads correctly in both themes without a `dark:`
 * fork, and the whole thing collapses to a single static line under
 * `prefers-reduced-motion`.
 *
 * Used anywhere a generation takes 10–30s and a bare spinner would read as
 * stalled — the course wizard, the generator panel, the landing-page demo.
 */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

import { DURATION } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface AITextLoadingProps {
  /** Cycled in order, then wrapped. */
  texts?: string[];
  className?: string;
  /** ms between swaps. */
  interval?: number;
}

const DEFAULT_TEXTS = [
  "Thinking…",
  "Planning modules…",
  "Writing lessons…",
  "Almost there…",
];

export function AITextLoading({
  texts = DEFAULT_TEXTS,
  className,
  interval = 1600,
}: AITextLoadingProps) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced || texts.length < 2) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % texts.length);
    }, interval);
    return () => clearInterval(timer);
  }, [interval, texts.length, reduced]);

  // Static single line — no sweep, no swap — when motion is turned down.
  if (reduced) {
    return (
      <p
        role="status"
        aria-live="polite"
        className={cn("text-center text-lg font-semibold text-foreground", className)}
      >
        {texts[0]}
      </p>
    );
  }

  return (
    <div className="flex w-full items-center justify-center" role="status" aria-live="polite">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 12 }}
          animate={{
            opacity: 1,
            y: 0,
            backgroundPosition: ["200% center", "-200% center"],
          }}
          exit={{ opacity: 0, y: -12 }}
          transition={{
            opacity: { duration: DURATION.base },
            y: { duration: DURATION.base },
            backgroundPosition: { duration: 2.5, ease: "linear", repeat: Infinity },
          }}
          className={cn(
            "block bg-[length:200%_100%] bg-clip-text text-center text-lg font-semibold text-transparent",
            // Foreground → muted → foreground gives the light sweep in both
            // themes; `text-transparent` lets the gradient show through.
            "bg-gradient-to-r from-foreground via-muted-foreground to-foreground",
            className,
          )}
        >
          {texts[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export default AITextLoading;
