"use client";

import { Sidebar } from "@/components/shared/sidebar";
import { Navbar } from "@/components/shared/navbar";
import { BottomNav } from "@/components/shared/bottom-nav";
import type { ProfileSummary } from "@/lib/data/dashboard";

export function DashboardShell({
  profile,
  children,
}: {
  profile: ProfileSummary;
  children: React.ReactNode;
}) {
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

      {/* Desktop-only sidebar. On mobile the bottom tab bar carries the primary
          routes and the navbar's drawer carries the rest. */}
      <aside className="hidden h-full w-64 flex-shrink-0 md:block">
        <Sidebar profile={profile} />
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
