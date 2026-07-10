"use client";

import { useState } from "react";
import { Sidebar } from "@/components/shared/sidebar";
import { Navbar } from "@/components/shared/navbar";
import { MobileNav } from "@/components/shared/mobile-nav";
import { BottomNav } from "@/components/shared/bottom-nav";
import type { ProfileSummary } from "@/lib/data/dashboard";

export function DashboardShell({
  profile,
  children,
}: {
  profile: ProfileSummary;
  children: React.ReactNode;
}) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <aside className="hidden h-full w-[250px] flex-shrink-0 md:block">
        <Sidebar profile={profile} />
      </aside>

      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        profile={profile}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onOpenMobileNav={() => setIsMobileNavOpen(true)} profile={profile} />
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
