"use client";

import { motion, useReducedMotion } from "framer-motion";

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
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
