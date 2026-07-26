/**
 * LazyPrep motion vocabulary.
 *
 * The JS half of the motion scale. The CSS half lives in `globals.css` as
 * `--dur-*` / `--ease-*`; the two are kept in sync by hand because Tailwind v4
 * has no `--duration-*` theme namespace to share.
 *
 * Rules of the system:
 * - UI motion stays ≤ 250ms. Anything slower must be earning it.
 * - Springs are for celebratory moments (completion, unlock, level-up) and for
 *   anything the finger is dragging. Tweens are for everything else.
 * - Nothing here branches on `prefers-reduced-motion` — that is the caller's
 *   job, via `useMotionSafe()` or the primitives in components/motion/motion.tsx.
 *
 * Plain module (no "use client") so server components can import the constants.
 */

import type { TargetAndTransition, Transition, Variants } from "framer-motion";

/** Seconds. Mirrors --dur-* in globals.css. */
export const DURATION = {
  /** Colour/opacity swaps that should feel instant. */
  instant: 0.1,
  /** Exits, hovers, small state flips. */
  fast: 0.15,
  /** The default. Reveals, page transitions, content swaps. */
  base: 0.2,
  /** Progress fills and other "watch it happen" motion. */
  slow: 0.35,
  /** Score rings, celebration beats. */
  celebrate: 0.6,
} as const;

export const EASE = {
  /** Default for reveals. Kept as the framer keyword — 16 files already use it. */
  out: "easeOut",
  standard: [0.4, 0, 0.2, 1],
  /** Decelerating, slightly overshooting. Matches --ease-emphasized. */
  emphasized: [0.16, 1, 0.3, 1],
  exit: [0.4, 0, 1, 1],
} as const;

export const SPRING = {
  /** Layout moves, docks, drawers, the bottom-nav pill. */
  snappy: { type: "spring", stiffness: 400, damping: 30 },
  /** Panels and cards settling into place. */
  smooth: { type: "spring", stiffness: 300, damping: 24 },
  /** Celebration pops — badges, checkmarks, XP. */
  bouncy: { type: "spring", stiffness: 450, damping: 18 },
  /** Counter tuning for AnimatedNumber. Deliberately soft; do not merge above. */
  counter: { stiffness: 90, damping: 24 },
} as const satisfies Record<string, Transition>;

export const STAGGER = {
  tight: 0.04,
  base: 0.06,
  loose: 0.1,
} as const;

/** Shorthand tween builder: `tr()` is the house default. */
export function tr(
  duration: number = DURATION.base,
  ease: Transition["ease"] = EASE.out as Transition["ease"],
): Transition {
  return { duration, ease };
}

/**
 * Horizontal shake used to reject a wrong answer. One amplitude for the whole
 * app — quiz and match blocks previously disagreed (±7/±5 vs ±6/±4).
 *
 * `x` is intentionally a mutable `number[]`: framer's keyframe types reject
 * readonly tuples.
 */
export const SHAKE: { x: number[]; transition: Transition } = {
  x: [0, -6, 6, -4, 4, 0],
  transition: { duration: DURATION.slow },
};

/**
 * Reveal targets.
 *
 * Exported as concrete `TargetAndTransition` objects rather than only as
 * `Variants`, because `Variants` widens each entry to include resolver
 * functions — which makes them unusable as a direct `initial`/`animate` value.
 * The `*Variants` records below are built from these for variant-driven usage.
 */
export const FADE = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
} as const satisfies Record<string, TargetAndTransition>;

export const SLIDE_UP = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
} as const satisfies Record<string, TargetAndTransition>;

export const SCALE_IN = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1 },
} as const satisfies Record<string, TargetAndTransition>;

export const fadeVariants: Variants = FADE;
export const slideUpVariants: Variants = SLIDE_UP;
export const scaleInVariants: Variants = SCALE_IN;
