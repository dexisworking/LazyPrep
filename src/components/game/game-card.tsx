import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const tones = {
  neutral: "border-border-strong",
  xp: "border-game-xp/40",
  flame: "border-game-flame/40",
  gem: "border-game-gem/40",
  win: "border-game-win/40",
  epic: "border-game-epic/40",
} as const;

const tints = {
  neutral: undefined,
  xp: "var(--game-xp)",
  flame: "var(--game-flame)",
  gem: "var(--game-gem)",
  win: "var(--game-win)",
  epic: "var(--game-epic)",
} as const;

export type GameCardProps = {
  children: ReactNode;
  tone?: keyof typeof tones;
  /** Adds the 4px bottom edge that gives the card physical weight. */
  raised?: boolean;
  className?: string;
};

/**
 * The chunky surface of the game layer.
 *
 * Differs from `ui/card.tsx` in three deliberate ways: a bigger radius, a 2px
 * border instead of 1px, and an optional solid bottom edge. Together those read
 * as a physical tile rather than a document panel.
 */
export function GameCard({
  children,
  tone = "neutral",
  raised = true,
  className,
}: GameCardProps) {
  const tint = tints[tone];
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border-2 bg-card p-5",
        tones[tone],
        raised && "shadow-[0_4px_0_0_var(--border-subtle)]",
        className,
      )}
    >
      {/* Very low-opacity wash so a toned card reads as "themed", not "coloured". */}
      {tint && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: tint, opacity: 0.05 }}
        />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
