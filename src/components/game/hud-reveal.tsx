"use client";

/**
 * Staggered spring reveal for the HUD dialogs (streak, level).
 *
 * Adapted from the kokonutui "Smooth Drawer" motion: the panel springs up as a
 * unit while its children cascade in behind it. The reference shipped this as a
 * whole drawer component built on `vaul`; LazyPrep's HUD detail already lives in
 * a Base UI `Dialog` with focus trapping, scroll lock and Escape handled — so
 * what's worth borrowing is the *motion*, not a second overlay primitive and a
 * new dependency.
 *
 * Both wrappers no-op under `prefers-reduced-motion`.
 */

import { motion, useReducedMotion, type Variants } from "framer-motion";

import { SPRING } from "@/lib/motion";
import { cn } from "@/lib/utils";

const container: Variants = {
  hidden: { y: 24, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { ...SPRING.smooth, staggerChildren: 0.06, delayChildren: 0.08 },
  },
};

const item: Variants = {
  hidden: { y: 14, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: SPRING.smooth },
};

export function HudReveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div initial="hidden" animate="visible" variants={container} className={className}>
      {children}
    </motion.div>
  );
}

export function HudItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div variants={item} className={className}>
      {children}
    </motion.div>
  );
}

/** Springy press/hover for the navbar HUD chips. */
export function HudChip({
  children,
  className,
  ...props
}: React.ComponentProps<typeof motion.button>) {
  const reduced = useReducedMotion();
  return (
    <motion.button
      type="button"
      whileHover={reduced ? undefined : { scale: 1.05, y: -1 }}
      whileTap={reduced ? undefined : { scale: 0.94 }}
      transition={reduced ? { duration: 0 } : SPRING.bouncy}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.button>
  );
}
