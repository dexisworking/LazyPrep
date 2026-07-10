"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth-client";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getRank } from "@/lib/xp";
import { LogoMark, Wordmark } from "@/components/brand/logo";
import { navRoutes, isRouteActive } from "@/lib/nav";
import { DexForgeCredit } from "@/components/shared/dexforge-credit";
import type { ProfileSummary } from "@/lib/data/dashboard";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileSummary;
}

export function MobileNav({ isOpen, onClose, profile }: MobileNavProps) {
  const pathname = usePathname();

  const userLevel = profile.level;
  const displayName = profile.displayName;
  const userRank = getRank(userLevel);

  const handleSignOut = async () => {
    onClose();
    await signOut();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="left"
        className="w-[290px] gap-0 border-border bg-sidebar p-0 text-sidebar-foreground"
      >
        {/* Header */}
        <div className="flex h-16 items-center gap-2 border-b border-border/50 px-6"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <LogoMark className="h-6 w-6" />
          <Wordmark className="text-lg" />
          <SheetTitle className="sr-only">Navigation menu</SheetTitle>
        </div>

        {/* Links */}
        <div className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
          {navRoutes.map((route) => {
            const isActive = isRouteActive(pathname, route.href);
            return (
              <Link
                key={route.href}
                href={route.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:scale-[0.98]",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold border-l-2 border-primary pl-2.5"
                    : "text-muted-foreground",
                )}
              >
                <route.icon className={cn("h-4 w-4", route.color)} />
                {route.label}
              </Link>
            );
          })}
        </div>

        {/* User card + credits */}
        <div
          className="space-y-3 border-t border-border/50 p-4"
          style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
        >
          <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-card/35 p-3">
            <Avatar className="h-9 w-9 border border-border">
              <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                {displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <h4 className="truncate text-sm font-medium leading-none text-foreground">
                {displayName}
              </h4>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {userRank} (Lvl {userLevel})
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 active:scale-[0.98]"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>

          <DexForgeCredit compact />
        </div>
      </SheetContent>
    </Sheet>
  );
}
