"use client";

import { useState } from "react";
import { MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";

export type FlipBlockData = {
  title?: string;
  cards: { front: string; back: string }[];
};

/** A grid of tap-to-reveal mini flashcards embedded in a lesson. */
export function FlipBlock({ data }: { data: FlipBlockData }) {
  const [flipped, setFlipped] = useState<Set<number>>(new Set());

  const toggle = (i: number) =>
    setFlipped((s) => {
      const next = new Set(s);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <div className="np-block my-6">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15">
          <MousePointerClick className="h-3.5 w-3.5 text-primary" />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
          {data.title ?? "Tap to reveal"}
        </span>
      </div>
      <div
        className={cn(
          "grid gap-3",
          data.cards.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2",
          data.cards.length >= 5 && "lg:grid-cols-3",
        )}
      >
        {data.cards.map((card, i) => {
          const isFlipped = flipped.has(i);
          return (
            <button
              key={i}
              type="button"
              onClick={() => toggle(i)}
              className="group block w-full text-left [perspective:900px]"
              aria-label={isFlipped ? "Hide answer" : "Reveal answer"}
            >
              <div
                className={cn(
                  "relative min-h-[7rem] w-full transition-transform duration-400 [transform-style:preserve-3d] motion-reduce:transition-none",
                  isFlipped && "[transform:rotateY(180deg)]",
                )}
              >
                <div className="absolute inset-0 flex items-center justify-center rounded-xl border border-border/60 bg-card p-4 text-center [backface-visibility:hidden] group-hover:border-primary/40">
                  <p className="text-sm font-semibold leading-snug text-foreground">{card.front}</p>
                </div>
                <div className="absolute inset-0 flex items-center justify-center rounded-xl border border-primary/40 bg-primary/[0.07] p-4 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <p className="text-sm leading-snug text-foreground">{card.back}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
