"use client";

/**
 * The hero's live demo: pick a subject, watch a course get built, start learning.
 *
 * This replaces the static phone screenshot that used to sit here. A screenshot
 * shows what the product looks like; this shows what it *does* — which is the
 * one thing the headline is actually claiming ("generate a complete course for
 * any subject").
 *
 * The badge cloud is adapted from the marketing-badges pattern, but laid out
 * with flex-wrap + per-item rotation/offset rather than absolute coordinates.
 * Hand-placed offsets can't survive a 380px column, a 520px column and a
 * wrapped phone layout without colliding; this can.
 *
 * Nothing here calls the API — it's a scripted preview, labelled as such.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, RotateCcw, Sparkles, Wand2 } from "lucide-react";

import { AITextLoading } from "@/components/ui/ai-text-loading";
import { DURATION, SPRING } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Tone = "gem" | "flame" | "win" | "xp" | "epic" | "loss";

/** Solid game-palette faces. `--game-on-solid` is the solved label colour. */
const TONE_FACE: Record<Tone, string> = {
  gem: "bg-game-gem",
  flame: "bg-game-flame",
  win: "bg-game-win",
  xp: "bg-game-xp",
  epic: "bg-game-epic",
  loss: "bg-game-loss",
};

const TONE_SHADOW: Record<Tone, string> = {
  gem: "shadow-[0_4px_0_0_var(--game-gem-deep)]",
  flame: "shadow-[0_4px_0_0_var(--game-flame-deep)]",
  win: "shadow-[0_4px_0_0_var(--game-win-deep)]",
  xp: "shadow-[0_4px_0_0_var(--game-xp-deep)]",
  epic: "shadow-[0_4px_0_0_var(--game-epic-deep)]",
  loss: "shadow-[0_4px_0_0_var(--game-flame-deep)]",
};

type Subject = {
  label: string;
  tone: Tone;
  size: "sm" | "md" | "lg";
  rotate: number;
  dy: number;
};

const SUBJECTS: Subject[] = [
  { label: "Programming", tone: "gem", size: "lg", rotate: -3, dy: 0 },
  { label: "Photography", tone: "flame", size: "md", rotate: 2, dy: -6 },
  { label: "Thermodynamics", tone: "epic", size: "lg", rotate: -1.5, dy: 4 },
  { label: "Cybersecurity", tone: "loss", size: "md", rotate: 3, dy: -3 },
  { label: "Organic Chemistry", tone: "win", size: "lg", rotate: -2, dy: 5 },
  { label: "Linear Algebra", tone: "xp", size: "sm", rotate: 2.5, dy: -5 },
  { label: "Machine Learning", tone: "gem", size: "md", rotate: -2.5, dy: 3 },
  { label: "Microeconomics", tone: "flame", size: "sm", rotate: 1.5, dy: -2 },
];

const SIZE_CLS = {
  sm: "px-3.5 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-sm",
} as const;

/** ~3.6s of scripted build steps, so the payoff lands without feeling instant. */
const BUILD_MS = 3600;

const MODULES = [
  "Foundations & core vocabulary",
  "The concepts that carry the marks",
  "Worked problems & common traps",
  "Exam drills and timed practice",
];

export function CourseDemoWidget({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<"pick" | "building" | "ready">("pick");
  const [subject, setSubject] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const pick = useCallback((label: string) => {
    setSubject(label);
    setPhase("building");
    timer.current = setTimeout(() => setPhase("ready"), reduced ? 900 : BUILD_MS);
  }, [reduced]);

  const reset = () => {
    if (timer.current) clearTimeout(timer.current);
    setSubject(null);
    setPhase("pick");
  };

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-[1.75rem] border border-border-subtle bg-card/70 p-5 shadow-overlay backdrop-blur-xl sm:p-6",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-3xs font-semibold uppercase tracking-wide text-primary">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-60 motion-safe:animate-ping" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          Live demo
        </span>
        {phase !== "pick" && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-control px-2 py-1 text-2xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" />
            Try another
          </button>
        )}
      </div>

      {/* Body — one fixed-height stage so the hero doesn't jump between phases. */}
      <div className="relative mt-4 min-h-[24rem]">
        <AnimatePresence mode="wait">
          {phase === "pick" && (
            <motion.div
              key="pick"
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: DURATION.base }}
            >
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Create your own course
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick a subject — or bring your own. LazyPrep builds the modules,
                lessons, questions and flashcards around it.
              </p>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 px-1 py-3">
                {SUBJECTS.map((s, i) => (
                  <motion.button
                    key={s.label}
                    type="button"
                    onClick={() => pick(s.label)}
                    initial={reduced ? false : { opacity: 0, scale: 0.85, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: s.dy }}
                    transition={
                      reduced ? { duration: 0 } : { ...SPRING.smooth, delay: 0.05 * i }
                    }
                    whileHover={reduced ? undefined : { scale: 1.07, rotate: 0, y: s.dy - 4 }}
                    whileTap={{ scale: 0.96 }}
                    style={{ rotate: reduced ? 0 : s.rotate }}
                    className={cn(
                      "relative select-none rounded-full font-semibold text-game-on-solid",
                      "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                      TONE_FACE[s.tone],
                      TONE_SHADOW[s.tone],
                      SIZE_CLS[s.size],
                    )}
                  >
                    {/* Top gloss — reads as a physical chip rather than a flat tag. */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/30 to-transparent"
                    />
                    <span className="relative">{s.label}</span>
                  </motion.button>
                ))}
              </div>

              <p className="mt-2 flex items-center justify-center gap-1.5 text-2xs text-muted-foreground">
                <Wand2 className="h-3.5 w-3.5" />
                Tap any subject to watch a course get built
              </p>
            </motion.div>
          )}

          {phase === "building" && (
            <motion.div
              key="building"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DURATION.base }}
              className="flex min-h-[24rem] flex-col items-center justify-center gap-6 text-center"
            >
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-primary/20 motion-safe:animate-halo"
                />
                <Sparkles className="relative h-7 w-7 text-primary motion-safe:animate-streak-breathe" />
              </div>

              <AITextLoading
                texts={[
                  `Reading up on ${subject}…`,
                  "Mapping the syllabus…",
                  "Drafting modules & lessons…",
                  "Writing practice questions…",
                  "Building your flashcard deck…",
                ]}
                interval={720}
                className="text-xl"
              />

              <div className="h-1 w-40 overflow-hidden rounded-full bg-secondary">
                <div className="h-full w-1/3 rounded-full bg-primary motion-safe:animate-generator-sweep" />
              </div>
            </motion.div>
          )}

          {phase === "ready" && (
            <motion.div
              key="ready"
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={reduced ? { duration: 0 } : SPRING.smooth}
              className="flex min-h-[24rem] flex-col"
            >
              <h2 className="text-xl font-bold leading-snug tracking-tight text-balance text-foreground">
                Your <span className="text-primary">{subject}</span> course is waiting for you.
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                4 modules · 18 lessons · 60 practice questions · 40 flashcards
              </p>

              <ul className="mt-4 space-y-2">
                {MODULES.map((m, i) => (
                  <motion.li
                    key={m}
                    initial={reduced ? false : { opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={
                      reduced ? { duration: 0 } : { duration: DURATION.base, delay: 0.08 * i }
                    }
                    className="flex items-center gap-3 rounded-control border border-border-subtle bg-background/40 px-3 py-2.5"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-2xs font-bold text-primary tabular-nums">
                      {i + 1}
                    </span>
                    <span className="truncate text-sm text-foreground">{m}</span>
                  </motion.li>
                ))}
              </ul>

              <Link
                href="/sign-up"
                className="group mt-auto inline-flex items-center justify-center gap-2 rounded-control bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-[background-color,transform] duration-(--dur-fast) hover:bg-[color-mix(in_oklch,var(--primary),var(--foreground)_12%)] active:scale-[0.98]"
              >
                Start learning
                <ArrowRight className="h-4 w-4 transition-transform duration-(--dur-fast) group-hover:translate-x-0.5" />
              </Link>
              <p className="mt-2 text-center text-3xs text-muted-foreground">
                Preview only. Real courses are generated with your own AI key.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
