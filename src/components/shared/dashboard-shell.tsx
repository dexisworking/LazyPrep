"use client";

import { useCallback, useEffect, useState } from "react";

import { Sidebar } from "@/components/shared/sidebar";
import { Navbar } from "@/components/shared/navbar";
import { BottomNav } from "@/components/shared/bottom-nav";
import { cn } from "@/lib/utils";
import type { ProfileSummary } from "@/lib/data/dashboard";

const STORAGE_KEY = "lp:sidebar-collapsed";

export function DashboardShell({
  profile,
  children,
}: {
  profile: ProfileSummary;
  children: React.ReactNode;
}) {
  /*
   * Always renders expanded on the server, then adopts the stored preference on
   * mount. Reading localStorage during render would hydrate-mismatch, and a
   * one-frame width change is far cheaper than a hydration error.
   */
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCollapsed(window.localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // Private mode / storage disabled — the toggle still works for the session.
      }
      return next;
    });
  }, []);

  return (
    /*
     * `h-dvh w-full`, not `h-screen w-screen`: 100vw includes the desktop
     * scrollbar gutter (so the shell overflowed and `overflow-hidden` just
     * clipped it), and 100vh fights mobile browser chrome.
     */
    <div className="flex h-dvh w-full overflow-hidden bg-background text-foreground">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      {/* Desktop-only sidebar, retractable to an icon rail. On mobile the bottom
          tab bar carries the primary routes and Profile carries the rest. */}
      <aside
        className={cn(
          "hidden h-full flex-shrink-0 transition-[width] duration-(--dur-base) ease-emphasized motion-reduce:transition-none md:block",
          collapsed ? "w-[4.5rem]" : "w-64",
        )}
      >
        <Sidebar profile={profile} collapsed={collapsed} onToggle={toggle} />
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar profile={profile} />
        {/*
         * Bottom padding clears the fixed tab bar (h-16) plus the home-bar
         * inset. This replaces a hard-coded h-24 spacer div that overshot the
         * bar by 32px and ignored the safe area entirely.
         */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto px-4 py-6 pb-[calc(5rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-8 md:pb-8"
        >
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
