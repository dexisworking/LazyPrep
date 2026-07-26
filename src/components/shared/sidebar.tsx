"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { cn } from "@/lib/utils";
import { LogoMark, Wordmark } from "@/components/brand/logo";
import { navRoutes, isRouteActive } from "@/lib/nav";
import { DexForgeCredit } from "@/components/shared/dexforge-credit";
import { ProfileMenu } from "@/components/shared/profile-menu";
import type { ProfileSummary } from "@/lib/data/dashboard";

export function Sidebar({
  profile,
  collapsed = false,
  onToggle,
}: {
  profile: ProfileSummary;
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col border-r border-border-subtle bg-sidebar text-sidebar-foreground">
      {/* Brand + collapse toggle. In the compact rail the wordmark drops and the
          toggle takes the freed row so the header stays a single 4rem block. */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-border-subtle",
          collapsed ? "flex-col justify-center gap-1 px-2 py-1" : "gap-2 px-4",
        )}
      >
        <Link href="/dashboard" className="flex items-center gap-2" aria-label="LazyPrep home">
          <LogoMark className="h-7 w-7" />
          {!collapsed && <Wordmark className="text-lg" />}
        </Link>

        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "flex items-center justify-center rounded-control text-muted-foreground transition-colors duration-(--dur-fast) hover:bg-sidebar-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              collapsed ? "h-6 w-8" : "ml-auto h-8 w-8",
            )}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      <nav className={cn("flex-1 space-y-1", collapsed ? "p-2" : "p-3")} aria-label="Main">
        {navRoutes.map((route) => {
          const isActive = isRouteActive(pathname, route.href);
          return (
            <Link
              key={route.href}
              href={route.href}
              data-tour={`nav-${route.href.slice(1)}`}
              aria-current={isActive ? "page" : undefined}
              // `title` is the collapsed-state label — the visible text is gone,
              // so without it the rail is seven anonymous glyphs.
              title={collapsed ? route.label : undefined}
              className={cn(
                "group relative flex items-center rounded-control text-sm font-medium transition-colors duration-(--dur-fast)",
                collapsed ? "h-10 justify-center" : "gap-3 px-3 py-2.5",
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
              {!collapsed && route.label}
              {collapsed && <span className="sr-only">{route.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/*
        Account lives in the bottom-left corner in both states — as a full
        identity card when expanded, as a bare avatar in the rail. Sign-out moved
        into the menu, which is where the reference puts it and where a
        destructive action belongs: it was previously a permanently visible
        full-width destructive button one mis-click from ending your session.
      */}
      <div
        className={cn(
          "border-t border-border-subtle",
          collapsed ? "space-y-2 p-2" : "space-y-3 p-3",
        )}
      >
        <ProfileMenu profile={profile} compact={collapsed} />
        {!collapsed && <DexForgeCredit compact />}
      </div>
    </div>
  );
}
