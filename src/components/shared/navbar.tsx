"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { getLevelProgress } from "@/lib/xp";
import { getStreakStatus } from "@/lib/streak";
import { LogoMark, Wordmark } from "@/components/brand/logo";
import { RankArt } from "@/components/game/rank-art";
import { FlameVector } from "@/components/game/vectors";
import { LevelDialog } from "@/components/game/level-dialog";
import { StreakDialog } from "@/components/game/streak-dialog";
import { ThemeToggle } from "./theme-toggle";
import type { ProfileSummary } from "@/lib/data/dashboard";

interface NavbarProps {
  profile: ProfileSummary;
}

/** Shared chip shell for the two HUD counters. */
const chipCls =
  "flex h-9 items-center gap-1.5 rounded-full border-2 px-2.5 font-bold transition-[background-color,border-color,transform] duration-(--dur-fast) active:scale-95 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:px-3";

export function Navbar({ profile }: NavbarProps) {
  const [streakOpen, setStreakOpen] = useState(false);
  const [levelOpen, setLevelOpen] = useState(false);

  const { level, progress, currentLevelXp, nextLevelXp } = getLevelProgress(profile.xp);
  const streakStatus = getStreakStatus(profile.currentStreak);

  return (
    /*
     * Height is 4rem *plus* the safe-area inset rather than a flat h-16 with
     * inset padding — border-box meant the notch was eating into the bar and
     * squashing its contents on iOS standalone.
     */
    <header className="flex h-[calc(4rem+env(safe-area-inset-top))] w-full flex-shrink-0 items-center justify-between border-b border-border-subtle bg-background/80 px-3 pt-[env(safe-area-inset-top)] backdrop-blur-md sm:px-6">
      {/*
       * Brand on mobile; the desktop sidebar already carries it. No drawer here
       * by design — the bottom tab bar is the only mobile nav, and the routes it
       * can't hold (Bookmarks, Settings) hang off the Profile tab.
       */}
      <div className="flex items-center gap-2 md:hidden">
        <LogoMark className="size-7" />
        <Wordmark className="text-base" />
      </div>
      <div className="hidden md:block" />

      <div className="flex items-center gap-2">
        {/* Level chip — opens the rank dialog. */}
        <button
          type="button"
          onClick={() => setLevelOpen(true)}
          aria-haspopup="dialog"
          aria-label={`Level ${level}. View rank details.`}
          className={cn(chipCls, "border-game-xp/30 bg-game-xp/10 hover:border-game-xp/60")}
        >
          <RankArt level={level} size={22} animated={false} />
          <span className="text-sm tabular-nums text-foreground">{level}</span>
          <span className="hidden text-xs text-muted-foreground sm:inline">Lvl</span>
        </button>

        {/* Streak chip — opens the streak dialog. */}
        <button
          type="button"
          data-tour="streak"
          onClick={() => setStreakOpen(true)}
          aria-haspopup="dialog"
          aria-label={`${profile.currentStreak} day streak. View streak details.`}
          className={cn(chipCls, "border-game-flame/30 bg-game-flame/10 hover:border-game-flame/60")}
        >
          <FlameVector status={streakStatus} size={22} />
          <span className="text-sm tabular-nums text-foreground">{profile.currentStreak}</span>
          <span className="hidden text-xs text-muted-foreground sm:inline">day streak</span>
        </button>

        <ThemeToggle />
      </div>

      <LevelDialog
        open={levelOpen}
        onOpenChange={setLevelOpen}
        level={level}
        progress={progress}
        currentLevelXp={currentLevelXp}
        nextLevelXp={nextLevelXp}
        totalXp={profile.xp}
      />
      <StreakDialog
        open={streakOpen}
        onOpenChange={setStreakOpen}
        currentStreak={profile.currentStreak}
        longestStreak={profile.longestStreak}
        streakFreezes={profile.streakFreezes}
        lastStudyDate={profile.lastStudyDate}
        timezone={profile.timezone}
      />
    </header>
  );
}
