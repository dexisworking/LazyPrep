import type { Viewport } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/session";
import { toProfileSummary } from "@/lib/data/dashboard";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { TimezoneSync } from "@/components/shared/timezone-sync";

/**
 * Lock zoom inside the app (dashboard) pages only — this makes the installed
 * PWA feel native and stops accidental pinch/double-tap zoom while studying.
 * Nearest-wins viewport merging means the public landing + legal pages keep the
 * root viewport and stay zoomable. (Accessibility note: disabling user scaling
 * trades off WCAG 1.4.4; done deliberately per product decision for the app UI.)
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/sign-in");

  return (
    <DashboardShell profile={toProfileSummary(profile)}>
      <TimezoneSync current={profile.timezone} />
      {children}
    </DashboardShell>
  );
}
