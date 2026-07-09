"use client";

import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { Flame, Trophy, Menu } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { Progress } from "@/components/ui/progress";
import { getLevelProgress } from "@/lib/xp";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  onOpenMobileNav: () => void;
}

export function Navbar({ onOpenMobileNav }: NavbarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Hardcoded defaults for MVP profile info until dynamic profile fetch is integrated
  const userXp = 120; // Example starting XP
  const { level, progress, nextLevelXp } = getLevelProgress(userXp);
  const currentStreak = 3; // Example starting streak

  // Get Page Title from Pathname
  const getPageTitle = () => {
    if (!pathname) return "Dashboard";
    const segment = pathname.split("/")[1];
    if (!segment) return "Dashboard";
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border/50 bg-background/80 px-4 backdrop-blur-md sm:px-6">
      {/* Page Title & Mobile Toggle */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMobileNav}
          className="rounded-lg md:hidden text-muted-foreground hover:text-foreground"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {getPageTitle()}
        </h2>
      </div>

      {/* Quick Status Stats & Theme Toggle */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Level & XP Stats */}
        <div className="hidden items-center gap-3 rounded-xl border border-border/40 bg-card/30 px-3 py-1.5 md:flex">
          <div className="flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-np-orange" />
            <span className="text-xs font-semibold text-muted-foreground">Lvl {level}</span>
          </div>
          <div className="w-24">
            <Progress value={progress} className="h-1.5 bg-secondary" />
          </div>
          <span className="text-[10px] font-medium text-muted-foreground">
            {userXp % (level * 100)} / {nextLevelXp} XP
          </span>
        </div>

        {/* Streak Counter */}
        <div className="flex items-center gap-1.5 rounded-xl border border-border/40 bg-card/30 px-3 py-1.5">
          <Flame className="h-4 w-4 text-np-streak animate-pulse" />
          <span className="text-sm font-bold text-foreground">{currentStreak}</span>
          <span className="hidden text-xs font-medium text-muted-foreground sm:inline">day streak</span>
        </div>

        {/* Theme & Profile Toggles */}
        <div className="flex items-center gap-1">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
