import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/session";
import { toProfileSummary } from "@/lib/data/dashboard";
import { DashboardShell } from "@/components/shared/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/sign-in");

  return <DashboardShell profile={toProfileSummary(profile)}>{children}</DashboardShell>;
}
