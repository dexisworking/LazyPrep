"use client";

/**
 * Multi-phase "the model is working" console.
 *
 * Adapted from the kokonutui "AI Loading State" pattern. Two changes matter for
 * LazyPrep:
 *
 *  - the sequences are a prop, so flashcard generation and practice-bank
 *    generation narrate their *own* steps rather than a stock web-search script;
 *  - the ring colours come from the design tokens (primary / accent / success /
 *    xp / gem / red) instead of six arbitrary hex values, so the spinner belongs
 *    to the same palette as everything around it.
 *
 * Under `prefers-reduced-motion` the rings stop and the line list renders
 * statically — the copy is the useful part, the motion is decoration.
 */

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

export type LoadingSequence = {
  /** Headline shown next to the ring, e.g. "Drafting cards". */
  status: string;
  /** Console lines, revealed one at a time. */
  lines: string[];
};

const LINE_HEIGHT = 28;

function ProgressRings({ progress, spin }: { progress: number; spin: boolean }) {
  return (
    <div className="relative h-6 w-6 shrink-0">
      <svg
        className="h-full w-full"
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={`Working — ${Math.round(progress)}% through the current phase`}
      >
        <defs>
          <mask id="ai-loading-progress-mask">
            <rect width="240" height="240" fill="black" />
            <circle
              cx="120"
              cy="120"
              r="120"
              fill="white"
              strokeDasharray={`${(progress / 100) * 754}, 754`}
              transform="rotate(-90 120 120)"
            />
          </mask>
        </defs>

        <style>{`
          @keyframes ai-ring-cw { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes ai-ring-ccw { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
          .ai-rings circle { transform-origin: 120px 120px; }
          .ai-rings--spin circle:nth-child(odd) { animation: ai-ring-cw 8s linear infinite; }
          .ai-rings--spin circle:nth-child(even) { animation: ai-ring-ccw 8s linear infinite; }
          .ai-rings--spin circle:nth-child(2n) { animation-delay: 0.2s; }
          .ai-rings--spin circle:nth-child(3n) { animation-delay: 0.3s; }
        `}</style>

        <g
          className={cn("ai-rings", spin && "ai-rings--spin")}
          mask="url(#ai-loading-progress-mask)"
          strokeDasharray="18% 40%"
          strokeWidth="16"
        >
          <circle cx="120" cy="120" r="150" stroke="var(--primary)" opacity="0.95" />
          <circle cx="120" cy="120" r="130" stroke="var(--accent)" opacity="0.95" />
          <circle cx="120" cy="120" r="110" stroke="var(--np-success)" opacity="0.95" />
          <circle cx="120" cy="120" r="90" stroke="var(--game-xp)" opacity="0.95" />
          <circle cx="120" cy="120" r="70" stroke="var(--game-gem)" opacity="0.95" />
          <circle cx="120" cy="120" r="50" stroke="var(--np-red)" opacity="0.95" />
        </g>
      </svg>
    </div>
  );
}

export function AILoadingState({
  sequences,
  className,
}: {
  sequences: LoadingSequence[];
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState(0);
  const [visible, setVisible] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  const current = sequences[Math.min(phase, sequences.length - 1)];
  const total = current.lines.length;

  // Reveal one line at a time; roll into the next phase at the end of the list.
  //
  // Both updates are plain calls rather than one nested inside a `setVisible`
  // updater: updaters must be pure, and React invokes them twice in StrictMode,
  // which would double-advance the phase. Resetting `visible` here rather than
  // in a phase-change effect also keeps a single-sequence caller looping
  // instead of wedging on the last line.
  useEffect(() => {
    if (reduced) return;
    const timer = setTimeout(() => {
      if (visible < total) {
        setVisible(visible + 1);
      } else {
        setPhase((p) => (p + 1) % sequences.length);
        setVisible(1);
      }
    }, 1600);
    return () => clearTimeout(timer);
  }, [visible, total, sequences.length, reduced]);

  // Keep the newest line pinned to the bottom of the 3-line window.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = Math.max(0, (visible - 3) * LINE_HEIGHT);
  }, [visible]);

  const progress = reduced ? 100 : (visible / total) * 100;
  const lines = reduced ? current.lines.slice(0, 3) : current.lines.slice(0, visible);

  return (
    <div
      className={cn("flex w-full justify-center", className)}
      role="status"
      aria-live="polite"
    >
      <div className="w-full max-w-xs space-y-3">
        <div className="flex items-center gap-2 font-medium text-foreground">
          <ProgressRings progress={progress} spin={!reduced} />
          <span className="text-sm">{current.status}…</span>
        </div>

        <div className="relative">
          <div
            ref={scrollRef}
            className="h-[84px] overflow-hidden rounded-control font-mono text-xs"
            style={{ scrollBehavior: reduced ? "auto" : "smooth" }}
          >
            {lines.map((line, i) => (
              <div key={`${i}-${line}`} className="flex h-[28px] items-center px-2">
                <span className="w-5 shrink-0 select-none pr-2 text-right text-muted-foreground/60 tabular-nums">
                  {i + 1}
                </span>
                <span className="truncate text-muted-foreground">{line}</span>
              </div>
            ))}
          </div>
          {/* Top fade, so lines scrolling out don't just get chopped. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-control"
            style={{
              background:
                "linear-gradient(to bottom, var(--card) 0%, transparent 45%, transparent 100%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default AILoadingState;
