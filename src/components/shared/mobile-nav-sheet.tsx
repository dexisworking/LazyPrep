"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth-client";
import { isRouteActive, navRoutes } from "@/lib/nav";
import { getRank } from "@/lib/xp";
import { getStreakStatus } from "@/lib/streak";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LogoMark, Wordmark } from "@/components/brand/logo";
import { StreakFlame } from "@/components/shared/streak-flame";
import type { ProfileSummary } from "@/lib/data/dashboard";

/**
 * Mobile navigation drawer.
 *
 * The bottom tab bar only carries the five `mobilePrimary` routes, which left
 * Bookmarks and Settings — and Sign Out — with no entry point at all on mobile.
 * `lib/nav.ts` had documented a "mobile sheet drawer" as a consumer for a while;
 * this is it.
 *
 * Built on `ui/sheet.tsx` (Base UI Dialog), so focus trapping, Escape and focus
 * restoration come for free rather than being hand-rolled.
 */
export function MobileNavSheet({ profile }: { profile: ProfileSummary }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const streakStatus = getStreakStatus(profile.currentStreak);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Open navigation menu" />
        }
      >
        <Menu />
      </SheetTrigger>

      <SheetContent side="left" className="w-[19rem] max-w-[85vw] gap-0 p-0">
        <SheetHeader className="border-b border-border-subtle px-4 py-4">
          <SheetTitle className="flex items-center gap-2">
            <LogoMark className="h-6 w-6" />
            <Wordmark className="text-base" />
          </SheetTitle>
          <SheetDescription className="sr-only">
            Main navigation and account actions
          </SheetDescription>
        </SheetHeader>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="All pages">
          {navRoutes.map((route) => {
            const active = isRouteActive(pathname, route.href);
            return (
              <Link
                key={route.href}
                href={route.href}
                aria-current={active ? "page" : undefined}
                // Dismiss on navigate. Done here rather than in an effect on
                // `pathname` so there is no cascading render.
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition-colors duration-(--dur-fast)",
                  active
                    ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                )}
              >
                <route.icon
                  className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "")}
                />
                {route.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-3 border-t border-border-subtle p-3">
          <div className="flex items-center gap-3 rounded-card border border-border-subtle bg-card/40 p-3">
            <Avatar className="size-9 border border-border">
              <AvatarFallback className="bg-primary/10 text-xs font-bold uppercase text-primary">
                {profile.displayName.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {profile.displayName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {getRank(profile.level)} · Lvl {profile.level}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-xs">
                <StreakFlame status={streakStatus} className="h-3 w-3" />
                <span className="font-semibold text-foreground">
                  {profile.currentStreak}
                </span>
                <span className="text-muted-foreground">day streak</span>
              </p>
            </div>
          </div>

          <Button
            variant="destructive"
            className="w-full justify-start"
            onClick={() => void signOut()}
          >
            <LogOut />
            Sign Out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
