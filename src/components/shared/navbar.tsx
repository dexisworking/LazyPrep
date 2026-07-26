"use client";

import { useState } from "react";
import { Trophy } from "lucide-react";

import { cn } from "@/lib/utils";
import { getLevelProgress } from "@/lib/xp";
import { getStreakStatus } from "@/lib/streak";
import { ProgressBar } from "@/components/shared/progress-bar";
import { StreakFlame } from "@/components/shared/streak-flame";
import { StreakPanel } from "@/components/shared/streak-panel";
import { MobileNavSheet } from "@/components/shared/mobile-nav-sheet";
import { LogoMark } from "@/components/brand/logo";
import { ThemeToggle } from "./theme-toggle";
import type { ProfileSummary } from "@/lib/data/dashboard";

interface NavbarProps {
  profile: ProfileSummary;
}

export function Navbar({ profile }: NavbarProps) {
  const [streakOpen, setStreakOpen] = useState(false);

  const { level, progress, currentLevelXp, nextLevelXp } = getLevelProgress(profile.xp);
  const currentStreak = profile.currentStreak;
  const streakStatus = getStreakStatus(currentStreak);

  return (
    /*
     * Height is 4rem *plus* the safe-area inset rather than a flat h-16 with
     * inset padding — border-box meant the notch was eating into the bar and
     * squashing its contents on iOS standalone.
     *
     * No `sticky`: the scroll container is the sibling <main>, so it was a no-op.
     */
    <header className="flex h-[calc(4rem+env(safe-area-inset-top))] w-full flex-shrink-0 items-center justify-between border-b border-border-subtle bg-background/80 px-3 pt-[env(safe-area-inset-top)] backdrop-blur-md sm:px-6">
      {/*
       * Left slot. The page title used to live here as an <h2> derived from the
       * first path segment — which put an h2 before every page's h1 in DOM
       * order, and rendered "Courses" for a lesson three levels deep. Pages own
       * their own heading now.
       */}
      <div className="flex items-center gap-1 md:hidden">
        <MobileNavSheet profile={profile} />
        <LogoMark className="size-7" />
      </div>
      <div className="hidden md:block" />

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Level & XP — full widget on md+, compact chip below */}
        <div className="hidden items-center gap-3 rounded-control border border-border-subtle bg-card/40 px-3 py-1.5 md:flex">
          <div className="flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-np-orange" aria-hidden />
            <span className="text-xs font-semibold text-muted-foreground">Lvl {level}</span>
          </div>
          <ProgressBar
            value={progress}
            size="xs"
            className="w-24"
            aria-label={`Level ${level} progress`}
          />
          <span className="text-2xs font-medium tabular-nums text-muted-foreground">
            {currentLevelXp} / {nextLevelXp} XP
          </span>
        </div>
        <div className="flex items-center gap-1.5 whitespace-nowrap rounded-control border border-border-subtle bg-card/40 px-2.5 py-1.5 md:hidden">
          <Trophy className="h-3.5 w-3.5 flex-shrink-0 text-np-orange" aria-hidden />
          <span className="text-xs font-bold text-foreground">Lvl&nbsp;{level}</span>
        </div>

        {/* Streak */}
        <div className="relative">
          <button
            type="button"
            data-tour="streak"
            onClick={() => setStreakOpen((prev) => !prev)}
            aria-expanded={streakOpen}
            aria-haspopup="dialog"
            aria-label={`${currentStreak} day streak. Show streak details.`}
            className={cn(
              "flex h-9 items-center gap-1.5 rounded-control border px-2.5 transition-colors duration-(--dur-fast) sm:px-3",
              streakOpen
                ? "border-primary/40 bg-primary/5"
                : "border-border-subtle bg-card/40 hover:border-border hover:bg-card/70",
            )}
          >
            <StreakFlame status={streakStatus} className="h-4 w-4" />
            <span className="text-sm font-bold tabular-nums text-foreground">
              {currentStreak}
            </span>
            <span className="hidden text-xs font-medium text-muted-foreground sm:inline">
              day streak
            </span>
          </button>

          <StreakPanel
            open={streakOpen}
            onClose={() => setStreakOpen(false)}
            currentStreak={profile.currentStreak}
            longestStreak={profile.longestStreak}
            streakFreezes={profile.streakFreezes}
            lastStudyDate={profile.lastStudyDate}
            timezone={profile.timezone}
          />
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
}
