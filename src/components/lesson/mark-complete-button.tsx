"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Loader2, Zap } from "lucide-react";
import { markLessonComplete } from "@/lib/actions/progress";

export function MarkCompleteButton({
  lessonId,
  coursePath,
  initialCompleted,
  nextHref,
}: {
  lessonId: string;
  coursePath: string;
  initialCompleted: boolean;
  nextHref: string | null;
}) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const [completed, setCompleted] = useState(initialCompleted);
  const [xpGained, setXpGained] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleComplete = () => {
    startTransition(async () => {
      const result = await markLessonComplete(lessonId, coursePath);
      setCompleted(true);
      if (!result.alreadyComplete && result.xpAwarded > 0) {
        setXpGained(result.xpAwarded);
      }
      router.refresh();
    });
  };

  if (completed) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <motion.span
          initial={reduced ? false : { scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 18 }}
          className="inline-flex items-center gap-2 rounded-lg border border-np-success/30 bg-np-success/10 px-4 py-2.5 text-sm font-semibold text-np-success"
        >
          <motion.span
            initial={reduced ? false : { rotate: -30, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15, delay: 0.05 }}
          >
            <CheckCircle2 className="h-4 w-4" />
          </motion.span>
          Completed
        </motion.span>
        <AnimatePresence>
          {xpGained !== null && (
            <motion.span
              initial={reduced ? false : { y: 8, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.15 }}
              className="inline-flex items-center gap-1 text-sm font-medium text-np-xp"
            >
              <Zap className="h-4 w-4" />+{xpGained} XP
            </motion.span>
          )}
        </AnimatePresence>
        {nextHref && (
          <motion.button
            initial={reduced ? false : { opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: 0.25 }}
            onClick={() => router.push(nextHref)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
          >
            Next lesson
          </motion.button>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleComplete}
      disabled={isPending}
      className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
      Mark as Complete
    </button>
  );
}
