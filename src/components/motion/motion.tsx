"use client";

/**
 * NetPrep motion primitives — thin framer-motion wrappers used across the app.
 *
 * Rules of the system:
 * - UI motion stays ≤ 250ms; springs are reserved for celebratory moments.
 * - Every primitive respects `prefers-reduced-motion`: transforms are dropped
 *   and reveals become instant (opacity snaps to 1).
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
      transition={{ duration: 0.25, delay, ease: "easeOut" }}
      {...props}
    />
  );
}

/** Fade + rise in (optionally on scroll into view). */
export function SlideUp({ delay = 0, inView = false, ...props }: RevealProps) {
  const reduced = useReducedMotion();
  const initial = reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 };
  const anim = { opacity: 1, y: 0 };
  return (
    <motion.div
      initial={initial}
      {...(inView
        ? { whileInView: anim, viewport: { once: true, margin: "-40px" } }
        : { animate: anim })}
      transition={{ duration: 0.25, delay, ease: "easeOut" }}
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
  staggerDelay = 0.06,
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
        hidden: reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.25, ease: "easeOut" },
        },
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
  const spring = useSpring(0, { stiffness: 90, damping: 24 });
  const rounded = useTransform(spring, (v) => Math.round(v));
  const [display, setDisplay] = useState(reduced ? value : 0);

  useEffect(() => {
    if (reduced) {
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
