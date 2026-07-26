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
 * `viewportFit: "cover"` lets the shell paint into the safe-area insets.
 *
 * This previously also set `maximumScale: 1` / `userScalable: false` to stop
 * accidental pinch-zoom in the installed PWA. That is a WCAG 1.4.4 failure and
 * it is not needed for the stated goal: `touch-action: manipulation` on
 * interactive elements (see globals.css) already suppresses the accidental
 * double-tap zoom, without taking real zoom away from users who need it.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
