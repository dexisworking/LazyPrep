"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth-client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StreakFlame } from "@/components/shared/streak-flame";
import { getRank } from "@/lib/xp";
import { getStreakStatus } from "@/lib/streak";
import { LogoMark, Wordmark } from "@/components/brand/logo";
import { navRoutes, isRouteActive } from "@/lib/nav";
import { DexForgeCredit } from "@/components/shared/dexforge-credit";
import type { ProfileSummary } from "@/lib/data/dashboard";

export function Sidebar({ profile }: { profile: ProfileSummary }) {
  const pathname = usePathname();

  const displayName = profile.displayName;
  const userLevel = profile.level;
  const userRank = getRank(userLevel);
  const streakStatus = getStreakStatus(profile.currentStreak);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex h-full flex-col border-r border-border-subtle bg-sidebar text-sidebar-foreground">
      {/* App Logo — aligned to the nav list below, not inset past it. */}
      <div className="flex h-16 items-center gap-2 border-b border-border-subtle px-4">
        <LogoMark className="h-7 w-7" />
        <Wordmark className="text-lg" />
      </div>

      <nav className="flex-1 space-y-1 p-3" aria-label="Main">
        {navRoutes.map((route) => {
          const isActive = isRouteActive(pathname, route.href);
          return (
            <Link
              key={route.href}
              href={route.href}
              data-tour={`nav-${route.href.slice(1)}`}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition-colors duration-(--dur-fast)",
                isActive
                  ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
              )}
            >
              {/*
               * Active marker as an inset pseudo-element rather than a
               * `border-l-2` with a hand-compensated `pl-2.5` — the old version
               * only lined up because the border was exactly 2px.
               */}
              {isActive && (
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary"
                />
              )}
              <route.icon
                className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "")}
              />
              {route.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile Section */}
      <div className="space-y-3 border-t border-border-subtle p-3">
        <div className="flex items-center gap-3 rounded-card border border-border-subtle bg-card/40 p-3">
          <Avatar className="h-9 w-9 border border-border">
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs uppercase">
              {displayName.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <h4 className="text-sm font-medium leading-none truncate text-foreground">
              {displayName}
            </h4>
            <p className="mt-1 text-xs text-muted-foreground truncate">
              {userRank} (Lvl {userLevel})
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-xs">
              <StreakFlame status={streakStatus} className="h-3 w-3" />
              <span className="font-semibold text-foreground">{profile.currentStreak}</span>
              <span className="text-muted-foreground">day streak</span>
            </p>
          </div>
        </div>

        <Button
          variant="destructive"
          className="w-full justify-start"
          onClick={handleSignOut}
        >
          <LogOut />
          Sign Out
        </Button>

        <DexForgeCredit compact />
      </div>
    </div>
  );
}
