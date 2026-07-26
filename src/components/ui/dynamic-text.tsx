"use client";

/**
 * Rapid-fire greeting cycler that settles on the last entry.
 *
 * Adapted from the kokonutui "Dynamic Text" pattern. Runs once — it is an
 * entrance flourish, not a loop — and is used at the top of the onboarding
 * tour's welcome step. Under `prefers-reduced-motion` it renders the final
 * greeting immediately with no cycling.
 */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const GREETINGS = [
  "Hello",
  "नमस्ते",
  "こんにちは",
  "Bonjour",
  "Hola",
  "안녕하세요",
  "Ciao",
  "Hallo",
  "Olá",
  "Hello",
];

export function DynamicText({
  words = GREETINGS,
  className,
  interval = 260,
}: {
  words?: string[];
  className?: string;
  interval?: number;
}) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(reduced ? words.length - 1 : 0);

  useEffect(() => {
    if (reduced) return;
    const timer = setInterval(() => {
      setIndex((i) => {
        if (i >= words.length - 1) {
          clearInterval(timer);
          return i;
        }
        return i + 1;
      });
    }, interval);
    return () => clearInterval(timer);
  }, [interval, words.length, reduced]);

  const dot = (
    <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
  );

  return (
    <div
      className={cn("relative flex h-9 items-center overflow-hidden", className)}
      aria-label={words[words.length - 1]}
    >
      {reduced ? (
        <span className="flex items-center gap-2 text-xl font-bold text-foreground">
          {dot}
          {words[index]}
        </span>
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.span
            key={index}
            aria-hidden
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute flex items-center gap-2 text-xl font-bold text-foreground"
          >
            {dot}
            {words[index]}
          </motion.span>
        </AnimatePresence>
      )}
    </div>
  );
}

export default DynamicText;
