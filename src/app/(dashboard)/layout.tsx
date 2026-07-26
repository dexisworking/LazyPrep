import type { Viewport } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/session";
import { toProfileSummary } from "@/lib/data/dashboard";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { TimezoneSync } from "@/components/shared/timezone-sync";
import { StudyTimer } from "@/components/shared/study-timer";
import { DailyLoginBonus } from "@/components/shared/daily-login-bonus";
import { FeedbackWidget } from "@/components/feedback/feedback-widget";

/**
 * Lock the viewport inside the app shell so the installed PWA/TWA behaves like
 * a native app — no pinch or double-tap zoom, no rubber-banding of the frame
 * while studying. Nearest-wins viewport merging means the public landing and
 * legal pages keep the root viewport and stay zoomable.
 *
 * Accessibility note: this trades off WCAG 1.4.4. It is a deliberate product
 * decision for the app UI; the content itself is sized off the type scale, and
 * OS-level display scaling still applies.
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
      <StudyTimer />
      <DailyLoginBonus />
      {children}
      <FeedbackWidget />
    </DashboardShell>
  );
}
