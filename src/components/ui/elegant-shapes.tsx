"use client";

/**
 * Drifting glass slabs for the landing hero background.
 *
 * Adapted from the kokonutui "Shape Hero" backdrop. Two deliberate departures
 * from the reference: the gradients are built from LazyPrep's own tokens
 * (primary blue, accent orange, destructive red, success green) instead of the
 * indigo/rose/violet/amber set — the brand has exactly one blue and one orange
 * and the hero shouldn't invent four more hues — and this exports only the
 * *backdrop*, not a full hero, so the existing copy and CTAs stay untouched.
 *
 * Everything is transform/opacity only and the whole layer is `aria-hidden`.
 * Under `prefers-reduced-motion` the shapes render in their settled position
 * with no entrance and no drift.
 */

import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient,
  radius = 16,
  reduced,
}: {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  /** A CSS colour — the opaque end of the slab's gradient. */
  gradient: string;
  radius?: number;
  reduced: boolean;
}) {
  return (
    <motion.div
      className={cn("absolute", className)}
      initial={reduced ? false : { opacity: 0, y: -140, rotate: rotate - 15 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={
        reduced
          ? { duration: 0 }
          : {
              duration: 2.4,
              delay,
              ease: [0.23, 0.86, 0.39, 0.96],
              opacity: { duration: 1.2, delay },
            }
      }
    >
      <motion.div
        className="relative"
        style={{ width, height }}
        animate={reduced ? undefined : { y: [0, 14, 0] }}
        transition={
          reduced ? undefined : { duration: 12, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <div
          className="absolute inset-0 ring-1 ring-foreground/[0.04] backdrop-blur-[1px]"
          style={{
            borderRadius: radius,
            background: `linear-gradient(to right, ${gradient}, transparent)`,
          }}
        />
      </motion.div>
    </motion.div>
  );
}

/**
 * Absolutely positioned; drop it inside a `relative overflow-hidden` section.
 * Intentionally low-contrast — it sits behind body copy that has to stay
 * readable, so the slabs never exceed ~12% alpha.
 */
export function ElegantShapes({ className }: { className?: string }) {
  const reduced = useReducedMotion() ?? false;

  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {/* Tall slab — top left */}
      <ElegantShape
        reduced={reduced}
        className="-left-[15%] -top-[10%]"
        delay={0.3}
        width={300}
        height={500}
        rotate={-8}
        radius={24}
        gradient="color-mix(in oklch, var(--primary) 12%, transparent)"
      />
      {/* Wide slab — bottom right */}
      <ElegantShape
        reduced={reduced}
        className="-bottom-[8%] -right-[18%]"
        delay={0.5}
        width={600}
        height={200}
        rotate={15}
        radius={20}
        gradient="color-mix(in oklch, var(--accent) 11%, transparent)"
      />
      {/* Square — middle left */}
      <ElegantShape
        reduced={reduced}
        className="-left-[5%] top-[45%]"
        delay={0.4}
        width={300}
        height={300}
        rotate={24}
        radius={32}
        gradient="color-mix(in oklch, var(--np-success) 9%, transparent)"
      />
      {/* Small slab — top right */}
      <ElegantShape
        reduced={reduced}
        className="right-[8%] top-[6%]"
        delay={0.6}
        width={250}
        height={100}
        rotate={-20}
        radius={12}
        gradient="color-mix(in oklch, var(--destructive) 9%, transparent)"
      />
      {/* Medium slab — centre right */}
      <ElegantShape
        reduced={reduced}
        className="-right-[10%] top-[42%]"
        delay={0.7}
        width={400}
        height={150}
        rotate={35}
        radius={16}
        gradient="color-mix(in oklch, var(--primary) 10%, transparent)"
      />
      {/* Small square — bottom left */}
      <ElegantShape
        reduced={reduced}
        className="bottom-[6%] left-[18%]"
        delay={0.2}
        width={200}
        height={200}
        rotate={-25}
        radius={28}
        gradient="color-mix(in oklch, var(--accent) 8%, transparent)"
      />
    </div>
  );
}

export default ElegantShapes;
