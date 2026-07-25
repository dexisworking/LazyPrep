"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { Flame, Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { getLevelProgress } from "@/lib/xp";
import { getStreakStatus } from "@/lib/streak";
import { cn } from "@/lib/utils";
import { StreakPanel } from "@/components/shared/streak-panel";
import type { ProfileSummary } from "@/lib/data/dashboard";

const streakFlameColors = {
  cold: "text-muted-foreground",
  warm: "text-amber-400",
  hot: "text-orange-500",
  fire: "text-red-500 animate-pulse",
} as const;

interface NavbarProps {
  profile: ProfileSummary;
}

export function Navbar({ profile }: NavbarProps) {
  const pathname = usePathname();
  const [streakOpen, setStreakOpen] = useState(false);

  const userXp = profile.xp;
  const { level, progress, currentLevelXp, nextLevelXp } = getLevelProgress(userXp);
  const currentStreak = profile.currentStreak;
  const streakStatus = getStreakStatus(currentStreak);

  // Get Page Title from Pathname
  const getPageTitle = () => {
    if (!pathname) return "Dashboard";
    const segment = pathname.split("/")[1];
    if (!segment) return "Dashboard";
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <header
      className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border/50 bg-background/80 px-4 backdrop-blur-md sm:px-6"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {/* Page Title */}
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {getPageTitle()}
        </h2>
      </div>

      {/* Quick Status Stats & Theme Toggle */}
      <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
        {/* Level & XP — full widget on md+, compact chip on mobile */}
        <div className="hidden items-center gap-3 rounded-xl border border-border/40 bg-card/30 px-3 py-1.5 md:flex">
          <div className="flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-np-orange" />
            <span className="text-xs font-semibold text-muted-foreground">Lvl {level}</span>
          </div>
          <div className="w-24">
            <Progress value={progress} className="h-1.5 bg-secondary" />
          </div>
          <span className="text-[10px] font-medium text-muted-foreground">
            {currentLevelXp} / {nextLevelXp} XP
          </span>
        </div>
        <div className="flex items-center gap-1.5 whitespace-nowrap rounded-xl border border-border/40 bg-card/30 px-2.5 py-1.5 md:hidden">
          <Trophy className="h-3.5 w-3.5 flex-shrink-0 text-np-orange" />
          <span className="text-xs font-bold text-foreground">Lvl&nbsp;{level}</span>
        </div>

        {/* Streak Counter — now clickable with panel */}
        <div className="relative">
          <button
            data-tour="streak"
            onClick={() => setStreakOpen((prev) => !prev)}
            className={cn(
              "flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 sm:px-3 transition-colors",
              streakOpen
                ? "border-primary/40 bg-primary/5"
                : "border-border/40 bg-card/30 hover:border-border hover:bg-card/50",
            )}
          >
            <Flame className={cn("h-4 w-4", streakFlameColors[streakStatus])} />
            <span className="text-sm font-bold text-foreground">{currentStreak}</span>
            <span className="hidden text-xs font-medium text-muted-foreground sm:inline">day streak</span>
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

        {/* Theme & Profile Toggles */}
        <div className="flex items-center gap-1">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
