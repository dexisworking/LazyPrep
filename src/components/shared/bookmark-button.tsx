"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bookmark } from "lucide-react";

import { toggleBookmark, type BookmarkTargetType } from "@/lib/actions/bookmarks";
import { SPRING } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Five particles on a jittered ring. Recomputed per burst so no two match. */
function makeParticles() {
  return Array.from({ length: 5 }, (_, i) => {
    const angle = (i / 5) * Math.PI * 2;
    const radius = 18 + Math.random() * 8;
    return {
      id: i,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius * 0.75,
      scale: 0.8 + Math.random() * 0.4,
      size: 4 + Math.random() * 2,
      duration: 0.6 + Math.random() * 0.1,
      delay: i * 0.04,
    };
  });
}

/**
 * Bookmark toggle with a one-shot save burst.
 *
 * The animation only fires on a *user* save — not when the button mounts
 * already-bookmarked — so the bookmarks page doesn't detonate a dozen particle
 * bursts on load. Colour follows the existing `streak-warm` token rather than
 * the reference's hard-coded blue, since that's what "saved" already means
 * everywhere else in the app.
 */
export function BookmarkButton({
  targetType,
  targetId,
  initialBookmarked = false,
  className,
}: {
  targetType: BookmarkTargetType;
  targetId: string;
  initialBookmarked?: boolean;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [burst, setBurst] = useState<ReturnType<typeof makeParticles> | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const next = !bookmarked;
    setBookmarked(next);
    setBurst(next && !reduced ? makeParticles() : null);

    startTransition(async () => {
      const res = await toggleBookmark(targetType, targetId);
      if (res.ok) {
        setBookmarked(res.isBookmarked);
        if (!res.isBookmarked) setBurst(null);
      } else {
        setBookmarked(!next); // Rollback on error
        setBurst(null);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      title={bookmarked ? "Remove bookmark" : "Save bookmark"}
      aria-label={bookmarked ? "Remove bookmark" : "Save bookmark"}
      aria-pressed={bookmarked}
      className={cn(
        "relative inline-flex items-center justify-center rounded-control p-2 transition-colors hover:bg-foreground/10 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        bookmarked ? "text-streak-warm" : "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      <motion.span
        className="relative flex items-center justify-center"
        animate={{ scale: bookmarked && !reduced ? 1.1 : 1 }}
        whileTap={reduced ? undefined : { scale: 0.85, rotate: bookmarked ? 0 : -10 }}
        transition={reduced ? { duration: 0 } : SPRING.bouncy}
      >
        <Bookmark className="h-5 w-5" aria-hidden />
        {/* Filled copy cross-fades over the outline so the glyph never jumps. */}
        <Bookmark
          aria-hidden
          className="absolute inset-0 h-5 w-5 fill-streak-warm text-streak-warm transition-opacity duration-(--dur-base)"
          style={{ opacity: bookmarked ? 1 : 0 }}
        />

        <AnimatePresence>
          {burst && bookmarked && (
            <motion.span
              key="glow"
              aria-hidden
              className="absolute -inset-2 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, color-mix(in oklch, var(--streak-warm) 40%, transparent) 0%, transparent 75%)",
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.4, 1], opacity: [0, 0.5, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>
      </motion.span>

      <AnimatePresence>
        {burst && bookmarked && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            {burst.map((p) => (
              <motion.span
                key={p.id}
                className="absolute rounded-full bg-streak-warm"
                style={{ width: p.size, height: p.size, filter: "blur(1px)" }}
                initial={{ scale: 0, opacity: 0.3, x: 0, y: 0 }}
                animate={{
                  scale: [0, p.scale, 0],
                  opacity: [0.3, 0.9, 0],
                  x: [0, p.x],
                  y: [0, p.y],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: p.duration, delay: p.delay, ease: "easeOut" }}
              />
            ))}
          </span>
        )}
      </AnimatePresence>
    </button>
  );
}
