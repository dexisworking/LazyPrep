import { Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { GameCard } from "@/components/game/game-card";
import { XpOrb } from "@/components/game/vectors";

export type Quest = {
  id: string;
  label: string;
  icon: LucideIcon;
  current: number;
  target: number;
  /** XP awarded on completion — shown as the carrot. */
  reward: number;
  tone: "xp" | "flame" | "gem" | "win";
};

const fills = {
  xp: "bg-game-xp",
  flame: "bg-game-flame",
  gem: "bg-game-gem",
  win: "bg-game-win",
} as const;

const inks = {
  xp: "text-game-xp",
  flame: "text-game-flame",
  gem: "text-game-gem",
  win: "text-game-win",
} as const;

/**
 * Today's objectives, as a checklist with visible progress and a reward.
 *
 * This is the single biggest behavioural lever in a study app: an explicit,
 * closeable list of small goals gives a reason to open the app on a day when
 * nothing is due. Targets are derived from real session data by the caller —
 * nothing here is decorative.
 */
export function DailyQuests({ quests, className }: { quests: Quest[]; className?: string }) {
  const done = quests.filter((q) => q.current >= q.target).length;

  return (
    <GameCard tone="gem" className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-extrabold tracking-tight text-foreground">Today&apos;s quests</h2>
        <span className="rounded-full bg-secondary px-2.5 py-1 text-2xs font-bold tabular-nums text-muted-foreground">
          {done} / {quests.length}
        </span>
      </div>

      <ul className="space-y-3">
        {quests.map((q) => {
          const complete = q.current >= q.target;
          const pct = Math.min(100, Math.round((q.current / Math.max(1, q.target)) * 100));
          return (
            <li key={q.id} className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border-2 transition-colors duration-(--dur-fast)",
                  complete
                    ? "border-game-win bg-game-win text-game-on-solid"
                    : "border-border-subtle bg-secondary",
                )}
              >
                {complete ? (
                  // One-shot overshoot on the tick, so a cleared quest reads as
                  // a small win when the dashboard loads.
                  <Check className="h-5 w-5 animate-pop" strokeWidth={3} />
                ) : (
                  <q.icon className={cn("h-5 w-5", inks[q.tone])} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-baseline justify-between gap-2">
                  <span
                    className={cn(
                      "truncate text-sm font-bold",
                      complete ? "text-muted-foreground line-through" : "text-foreground",
                    )}
                  >
                    {q.label}
                  </span>
                  <span className="shrink-0 text-2xs font-bold tabular-nums text-muted-foreground">
                    {Math.min(q.current, q.target)}/{q.target}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn(
                      "h-full rounded-full transition-[width] duration-(--dur-slow) ease-emphasized motion-reduce:transition-none",
                      fills[q.tone],
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <span
                className={cn(
                  "flex shrink-0 items-center gap-1 text-xs font-bold tabular-nums",
                  complete ? "text-game-win" : "text-muted-foreground",
                )}
              >
                <XpOrb size={14} />
                {q.reward}
              </span>
            </li>
          );
        })}
      </ul>
    </GameCard>
  );
}
