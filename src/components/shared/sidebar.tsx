"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth-client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getRank } from "@/lib/xp";
import { LogoMark, Wordmark } from "@/components/brand/logo";
import { navRoutes, isRouteActive } from "@/lib/nav";
import { DexForgeCredit } from "@/components/shared/dexforge-credit";
import type { ProfileSummary } from "@/lib/data/dashboard";

export function Sidebar({ profile }: { profile: ProfileSummary }) {
  const pathname = usePathname();

  const displayName = profile.displayName;
  const userLevel = profile.level;
  const userRank = getRank(userLevel);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex h-full flex-col border-r border-border bg-sidebar text-sidebar-foreground">
      {/* App Logo */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-border/50">
        <LogoMark className="h-7 w-7" />
        <Wordmark className="text-lg" />
      </div>

      {/* Main Navigation */}
      <div className="flex-1 space-y-1 px-4 py-6">
        {navRoutes.map((route) => {
          const isActive = isRouteActive(pathname, route.href);
          return (
            <Link
              key={route.href}
              href={route.href}
              data-tour={`nav-${route.href.slice(1)}`}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group",
                isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold border-l-2 border-primary pl-2.5" : "text-muted-foreground"
              )}
            >
              <route.icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", route.color)} />
              {route.label}
            </Link>
          );
        })}
      </div>

      {/* Bottom Profile Section */}
      <div className="border-t border-border/50 p-4 space-y-3">
        <div className="flex items-center gap-3 rounded-lg bg-card/30 p-3 border border-border/40">
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
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>

        <DexForgeCredit compact />
      </div>
    </div>
  );
}
