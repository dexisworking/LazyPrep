import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/motion/motion";
import { GameCard } from "@/components/game/game-card";
import { ProgressRing } from "@/components/game/progress-ring";
import { RankMedal, XpOrb } from "@/components/game/vectors";

export type PlayerCardProps = {
  displayName: string;
  level: number;
  rank: string;
  /** 0–100 toward the next level. */
  progress: number;
  currentLevelXp: number;
  nextLevelXp: number;
  totalXp: number;
  className?: string;
};

/**
 * The "who am I in this game" surface — the first thing on the dashboard.
 *
 * The level lives inside the ring rather than next to it, so a single glance
 * gives identity, rank and progress-to-next-level at once. The old hero had the
 * same three facts spread across a pill, an h1 and a separate bar.
 */
export function PlayerCard({
  displayName,
  level,
  rank,
  progress,
  currentLevelXp,
  nextLevelXp,
  totalXp,
  className,
}: PlayerCardProps) {
  // Rank ladder position drives the medal's metal.
  const tier = Math.min(4, Math.floor(level / 5));

  return (
    <GameCard tone="xp" className={cn("p-6 sm:p-7", className)}>
      <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
        <ProgressRing
          value={progress}
          size={116}
          thickness={11}
          tone="xp"
          glow
          label={`Level ${level}, ${progress}% to level ${level + 1}`}
        >
          <span className="text-3xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Level
          </span>
          <span className="text-4xl font-extrabold tabular-nums text-foreground">{level}</span>
        </ProgressRing>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center">
            <RankMedal tier={tier} size={40} className="animate-float" />
            <div className="min-w-0">
              <p className="truncate text-2xl font-extrabold tracking-tight text-foreground">
                {displayName}
              </p>
              <p className="text-sm font-semibold text-game-xp">{rank}</p>
            </div>
          </div>

          {/* XP bar with a gloss sweep — the "fill me" affordance. */}
          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <XpOrb size={16} />
                <span className="tabular-nums text-foreground">
                  <AnimatedNumber value={totalXp} /> XP
                </span>
              </span>
              <span className="tabular-nums text-muted-foreground">
                {currentLevelXp} / {nextLevelXp} to Lvl {level + 1}
              </span>
            </div>
            <div className="relative h-3.5 w-full overflow-hidden rounded-full border border-border-subtle bg-secondary">
              <div
                className="relative h-full rounded-full bg-game-xp transition-[width] duration-(--dur-celebrate) ease-emphasized motion-reduce:transition-none"
                style={{ width: `${Math.max(progress, 3)}%` }}
              >
                <span
                  aria-hidden
                  className="absolute inset-y-0 -left-1/3 w-1/3 bg-white/35 animate-shine"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </GameCard>
  );
}
