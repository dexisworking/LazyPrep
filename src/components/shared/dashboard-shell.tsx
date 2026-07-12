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
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Desktop-only sidebar. On mobile, nav is the bottom tab bar (Settings
          lives in the Profile page). */}
      <aside className="hidden h-full w-[250px] flex-shrink-0 md:block">
        <Sidebar profile={profile} />
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar profile={profile} />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
          {/* Spacer so content clears the mobile bottom tab bar */}
          <div className="h-24 md:hidden" aria-hidden />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
