"use client";

import { Zap } from "lucide-react";

import { cn } from "@/lib/utils";
import { getRank } from "@/lib/xp";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ProgressRing } from "@/components/game/progress-ring";
import { RANK_TIERS, RankArt, getRankTier } from "@/components/game/rank-art";
import { XpOrb } from "@/components/game/vectors";
import { HudItem, HudReveal } from "@/components/game/hud-reveal";

interface LevelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  level: number;
  progress: number;
  currentLevelXp: number;
  nextLevelXp: number;
  totalXp: number;
}

/**
 * Level and rank detail — the counterpart to the streak dialog, opened from the
 * level chip in the navbar.
 *
 * Shows the full rank ladder so the next rung is always visible: knowing that
 * "Scholar" is four levels away is a stronger pull than a bare level number.
 */
export function LevelDialog({
  open,
  onOpenChange,
  level,
  progress,
  currentLevelXp,
  nextLevelXp,
  totalXp,
}: LevelDialogProps) {
  const tier = getRankTier(level);
  const rank = getRank(level);
  const nextTier = RANK_TIERS[tier + 1];
  // `getLevelProgress` returns an unrounded float. The ring stroke keeps the
  // precise value for a smooth fill; anything read by a human gets rounded.
  const pct = Math.round(progress);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 rounded-3xl border-2 border-game-xp/40 p-0 sm:max-w-md">
        <HudReveal>
        <HudItem className="flex flex-col items-center gap-3 px-6 pb-5 pt-8 text-center">
          <RankArt level={level} size={104} />
          <div>
            <DialogTitle className="text-2xl font-extrabold tracking-tight text-foreground">
              {rank}
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm font-bold uppercase tracking-wider text-game-xp">
              Level {level}
            </DialogDescription>
          </div>
        </HudItem>

        <div className="space-y-5 border-t-2 border-border-subtle p-5">
          <HudItem className="flex items-center gap-5">
            <ProgressRing
              value={progress}
              size={92}
              thickness={9}
              tone="xp"
              label={`${pct}% to level ${level + 1}`}
            >
              <span className="text-lg font-extrabold tabular-nums text-foreground">
                {pct}%
              </span>
            </ProgressRing>
            <div className="min-w-0 flex-1 space-y-1.5 text-sm">
              <p className="flex items-center gap-1.5 font-bold text-foreground">
                <XpOrb size={16} />
                <span className="tabular-nums">{totalXp.toLocaleString()}</span> total XP
              </p>
              <p className="text-muted-foreground">
                <span className="font-bold tabular-nums text-foreground">
                  {nextLevelXp - currentLevelXp}
                </span>{" "}
                XP to reach <span className="font-bold text-foreground">Level {level + 1}</span>
              </p>
              {nextTier && (
                <p className="text-muted-foreground">
                  <span className="font-bold text-game-xp">{nextTier.name}</span> unlocks at level{" "}
                  <span className="font-bold tabular-nums text-foreground">{nextTier.min}</span>
                </p>
              )}
            </div>
          </HudItem>

          {/* Rank ladder */}
          <HudItem className="space-y-2">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Zap className="h-3.5 w-3.5 text-game-xp" />
              Rank ladder
            </p>
            <ul className="grid grid-cols-7 gap-1">
              {RANK_TIERS.map((t, i) => {
                const reached = level >= t.min;
                return (
                  <li
                    key={t.name}
                    title={`${t.name} · Level ${t.min}+`}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl border-2 py-2 transition-colors",
                      i === tier
                        ? "border-game-xp bg-game-xp/10"
                        : reached
                          ? "border-border-subtle bg-secondary/50"
                          : "border-transparent opacity-40",
                    )}
                  >
                    <RankArt level={t.min} size={26} animated={false} />
                    <span className="text-3xs font-bold tabular-nums text-muted-foreground">
                      {t.min}
                    </span>
                  </li>
                );
              })}
            </ul>
          </HudItem>
        </div>
        </HudReveal>
      </DialogContent>
    </Dialog>
  );
}
