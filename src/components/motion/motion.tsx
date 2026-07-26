"use client";

/**
 * LazyPrep motion primitives — thin framer-motion wrappers used across the app.
 *
 * Durations, easings and springs all come from `@/lib/motion`; nothing in here
 * declares its own numbers. See that module for the rules of the system.
 *
 * Every primitive respects `prefers-reduced-motion`: transforms are dropped and
 * reveals become instant (opacity snaps to 1). Components that hand-roll their
 * own framer markup should use `useMotionSafe()` rather than re-deriving the
 * same `reduced ? … : …` ternary.
 */

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useSpring,
  useTransform,
  type HTMLMotionProps,
} from "framer-motion";

import { DURATION, SCALE_IN, SLIDE_UP, SPRING, STAGGER, tr } from "@/lib/motion";

/**
 * Reduced-motion-aware transition helpers for components that build their own
 * framer markup.
 *
 * `t()` collapses a tween to zero duration and `s()` swaps a spring for an
 * instant tween, so callers can pass them unconditionally instead of branching
 * at every call site.
 */
export function useMotionSafe() {
  const reduced = useReducedMotion() ?? false;
  return {
    reduced,
    /** Tween, or an instant snap under reduced motion. */
    t: (duration: number = DURATION.base, ease?: Parameters<typeof tr>[1]) =>
      reduced ? { duration: 0 } : tr(duration, ease),
    /** Spring, or an instant snap under reduced motion. */
    s: (spring: (typeof SPRING)[keyof typeof SPRING] = SPRING.snappy) =>
      reduced ? { duration: 0 } : spring,
    /** `initial` value that disables mount animation under reduced motion. */
    initial: <T,>(value: T) => (reduced ? (false as const) : value),
  };
}

type RevealProps = HTMLMotionProps<"div"> & {
  /** Extra delay in seconds (used to hand-stagger small sets). */
  delay?: number;
  /** Animate when scrolled into view instead of on mount. */
  inView?: boolean;
};

/** Fade in (optionally on scroll into view). */
export function FadeIn({ delay = 0, inView = false, ...props }: RevealProps) {
  const reduced = useReducedMotion();
  const anim = { opacity: 1 };
  const initial = { opacity: reduced ? 1 : 0 };
  return (
    <motion.div
      initial={initial}
      {...(inView
        ? { whileInView: anim, viewport: { once: true, margin: "-40px" } }
        : { animate: anim })}
      transition={{ ...tr(), delay }}
      {...props}
    />
  );
}

/** Fade + rise in (optionally on scroll into view). */
export function SlideUp({ delay = 0, inView = false, ...props }: RevealProps) {
  const reduced = useReducedMotion();
  const initial = reduced ? SLIDE_UP.visible : SLIDE_UP.hidden;
  const anim = SLIDE_UP.visible;
  return (
    <motion.div
      initial={initial}
      {...(inView
        ? { whileInView: anim, viewport: { once: true, margin: "-40px" } }
        : { animate: anim })}
      transition={{ ...tr(), delay }}
      {...props}
    />
  );
}

/** Fade + scale in. For panels, dialogs and celebratory cards. */
export function ScaleIn({ delay = 0, inView = false, ...props }: RevealProps) {
  const reduced = useReducedMotion();
  const initial = reduced ? SCALE_IN.visible : SCALE_IN.hidden;
  const anim = SCALE_IN.visible;
  return (
    <motion.div
      initial={initial}
      {...(inView
        ? { whileInView: anim, viewport: { once: true, margin: "-40px" } }
        : { animate: anim })}
      transition={{ ...SPRING.smooth, delay }}
      {...props}
    />
  );
}

/**
 * Staggered reveal container. Children must be `StaggerItem`s.
 * Usage: <Stagger><StaggerItem>…</StaggerItem>…</Stagger>
 */
export function Stagger({
  inView = false,
  staggerDelay = STAGGER.base,
  ...props
}: HTMLMotionProps<"div"> & { inView?: boolean; staggerDelay?: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? "visible" : "hidden"}
      {...(inView
        ? { whileInView: "visible", viewport: { once: true, margin: "-40px" } }
        : { animate: "visible" })}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
      {...props}
    />
  );
}

export function StaggerItem(props: HTMLMotionProps<"div">) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      variants={{
        hidden: reduced ? SLIDE_UP.visible : { opacity: 0, y: 14 },
        visible: { opacity: 1, y: 0, transition: tr() },
      }}
      {...props}
    />
  );
}

/**
 * Spring-animated integer counter for stat tiles. Counts up from 0 on first
 * view; renders the final value immediately for reduced motion.
 */
export function AnimatedNumber({
  value,
  className,
  suffix = "",
  prefix = "",
}: {
  value: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20px" });
  const spring = useSpring(0, SPRING.counter);
  const rounded = useTransform(spring, (v) => Math.round(v));
  const [display, setDisplay] = useState(reduced ? value : 0);

  useEffect(() => {
    if (reduced) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplay(value);
      return;
    }
    if (isInView) spring.set(value);
  }, [isInView, value, reduced, spring]);

  useEffect(() => {
    if (reduced) return;
    return rounded.on("change", (v) => setDisplay(v));
  }, [rounded, reduced]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
