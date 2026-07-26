import { redirect } from "next/navigation";
import { CalendarDays, KeyRound, Palette, Smartphone, User } from "lucide-react";
import { getSession, getCurrentProfile } from "@/lib/session";
import { getAiKeyStatus } from "@/lib/ai/keys";
import { getRank } from "@/lib/xp";
import { AiKeyForm } from "@/components/settings/ai-key-form";
import { AppIconPicker } from "@/components/settings/app-icon-picker";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { DeleteAccountSection } from "@/components/settings/delete-account-section";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { SectionHeader } from "@/components/shared/section-header";
import { SignOutButton } from "@/components/profile/sign-out-button";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getSession();
  const profile = await getCurrentProfile();
  if (!session?.user || !profile) redirect("/sign-in");

  const status = await getAiKeyStatus(profile.id);
  const displayName = profile.displayName ?? session.user.name ?? "Explorer";
  const memberSince = new Date(profile.createdAt).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Your account, appearance, and AI configuration.
        </p>
      </div>

      {/* Account */}
      <section className="space-y-4 rounded-card border border-border-subtle bg-card p-card">
        <SectionHeader
          size="sm"
          icon={User}
          title="Account"
          description="Your identity on LazyPrep."
        />
        <Separator />
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border border-border">
            {session.user.image && <AvatarImage src={session.user.image} alt={displayName} />}
            <AvatarFallback className="bg-primary/10 font-bold uppercase text-primary">
              {displayName.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{session.user.email}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="h-3 w-3" />
              Member since {memberSince} · {getRank(profile.level)} (Lvl {profile.level})
            </p>
          </div>
          <SignOutButton />
        </div>
      </section>

      {/* Appearance */}
      <section className="space-y-4 rounded-card border border-border-subtle bg-card p-card">
        <SectionHeader
          size="sm"
          icon={Palette}
          title="Appearance"
          description="Switch between dark and light mode."
        />
        <Separator />
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Theme</p>
          <ThemeToggle />
        </div>
      </section>

      {/* Notifications */}
      <NotificationSettings />

      {/* App icon */}
      <section className="space-y-4">
        <SectionHeader
          size="sm"
          icon={Smartphone}
          title="App Icon"
          description="Choose the icon used when you add LazyPrep to your home screen."
        />
        <AppIconPicker />
      </section>

      {/* AI configuration */}
      <section className="space-y-4">
        <SectionHeader
          size="sm"
          icon={KeyRound}
          title="AI Configuration"
          description="Bring your own key to generate custom courses. Stored encrypted — never shown again."
        />
        <AiKeyForm status={status} />
      </section>

      {/* Danger zone */}
      <DeleteAccountSection email={session.user.email} />
    </div>
  );
}
