"use client";

import { motion, useReducedMotion } from "framer-motion";

import { DURATION, tr } from "@/lib/motion";

/**
 * Re-mounts on every dashboard navigation, giving each page a subtle
 * fade + rise entrance. Reduced motion → instant render.
 */
export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={tr(DURATION.fast)}
    >
      {children}
    </motion.div>
  );
}
