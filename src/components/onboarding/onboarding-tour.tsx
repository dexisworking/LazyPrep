"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen, Brain, Flame, Sparkles, Target, X } from "lucide-react";
import { completeOnboarding } from "@/lib/actions/profile";

type Step = {
  /** `data-tour` value of the element to spotlight; omit for a centered card. */
  target?: string;
  icon: React.ElementType;
  title: string;
  body: string;
};

const STEPS: Step[] = [
  {
    icon: Sparkles,
    title: "Welcome to LazyPrep 👋",
    body: "Your preparation OS for any exam. Here's a 20-second tour of what's inside.",
  },
  {
    target: "nav-courses",
    icon: BookOpen,
    title: "Courses",
    body: "Study curated packs like CCNA, or generate a full mastery course for any subject with your own AI key.",
  },
  {
    target: "nav-practice",
    icon: Target,
    title: "Practice",
    body: "Answer MCQs to test yourself. Every miss lands in your Wrong-Answer Notebook until you nail it.",
  },
  {
    target: "nav-flashcards",
    icon: Brain,
    title: "Flashcards",
    body: "Spaced-repetition cards resurface right before you'd forget them. On mobile, swipe to grade.",
  },
  {
    target: "streak",
    icon: Flame,
    title: "Streaks & XP",
    body: "Study a little every day to build your streak, earn XP, and climb the ranks. Let's go!",
  },
];

const PAD = 8;

/** Finds the on-screen (visible) element for a `data-tour` value. */
function findTarget(name: string): HTMLElement | null {
  const els = Array.from(document.querySelectorAll<HTMLElement>(`[data-tour="${name}"]`));
  return els.find((el) => el.offsetParent !== null && el.getBoundingClientRect().width > 0) ?? null;
}

type Rect = { top: number; left: number; width: number; height: number };

export function OnboardingTour() {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(true);
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  // Render only on the client — the tour's layout depends on window size, so
  // SSR would hydrate-mismatch. Nothing to show server-side anyway.
  useEffect(() => setMounted(true), []);

  const step = STEPS[i];
  const isLast = i === STEPS.length - 1;

  const measure = useCallback(() => {
    if (!step.target) {
      setRect(null);
      return;
    }
    const el = findTarget(step.target);
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setRect({
      top: r.top - PAD,
      left: r.left - PAD,
      width: r.width + PAD * 2,
      height: r.height + PAD * 2,
    });
  }, [step.target]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    if (!active) return;
    const onChange = () => measure();
    window.addEventListener("resize", onChange);
    window.addEventListener("scroll", onChange, true);
    return () => {
      window.removeEventListener("resize", onChange);
      window.removeEventListener("scroll", onChange, true);
    };
  }, [active, measure]);

  const finish = useCallback(() => {
    setActive(false);
    // Fire-and-forget: persist that the tour was seen.
    void completeOnboarding();
  }, []);

  if (!mounted || !active) return null;

  // Tooltip placement: below the target if it's in the upper half, else above;
  // centered when there's no target.
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const vw = typeof window !== "undefined" ? window.innerWidth : 400;
  const cardW = Math.min(340, vw - 32);

  let cardStyle: React.CSSProperties;
  if (!rect) {
    cardStyle = { top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: cardW };
  } else {
    const centerX = rect.left + rect.width / 2;
    const left = Math.min(Math.max(16, centerX - cardW / 2), vw - cardW - 16);
    const below = rect.top + rect.height / 2 < vh * 0.55;
    cardStyle = below
      ? { top: rect.top + rect.height + 12, left, width: cardW }
      : { top: rect.top - 12, left, width: cardW, transform: "translateY(-100%)" };
  }

  const Icon = step.icon;
  const spring = reduced
    ? { duration: 0 }
    : ({ type: "spring", stiffness: 320, damping: 32 } as const);

  return (
    <div className="fixed inset-0 z-[80]" role="region" aria-label="Onboarding tour">
      {/* Click-blocking layer + dimming spotlight */}
      <div className="absolute inset-0" onClick={(e) => e.stopPropagation()}>
        {rect ? (
          <motion.div
            initial={false}
            animate={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
            transition={spring}
            className="pointer-events-none absolute rounded-xl ring-2 ring-primary/70"
            style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.72)" }}
          />
        ) : (
          <div className="absolute inset-0 bg-black/72" />
        )}
      </div>

      {/* Tooltip card — positioning lives on the outer div (transform),
          the scale/opacity animation on the inner one, so they don't conflict. */}
      <div className="fixed" style={cardStyle}>
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={reduced ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.18 }}
          className="w-full rounded-2xl border border-border/60 bg-card p-5 shadow-2xl"
        >
          <button
            onClick={finish}
            className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Skip tour"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <h3 className="mt-3 text-base font-semibold text-foreground">{step.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.body}</p>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {STEPS.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === i ? "w-4 bg-primary" : "w-1.5 bg-border"
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              {i > 0 && (
                <button
                  onClick={() => setI((n) => n - 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary active:scale-[0.97]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>
              )}
              <button
                onClick={() => (isLast ? finish() : setI((n) => n + 1))}
                className="inline-flex items-center gap-1 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.97]"
              >
                {isLast ? "Start learning" : "Next"}
                {!isLast && <ArrowRight className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {!isLast && (
            <button
              onClick={finish}
              className="mt-3 w-full text-center text-[11px] font-medium text-muted-foreground/70 transition-colors hover:text-muted-foreground"
            >
              Skip tour
            </button>
          )}
        </motion.div>
      </AnimatePresence>
      </div>
    </div>
  );
}
