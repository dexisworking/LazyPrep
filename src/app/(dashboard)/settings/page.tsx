import { redirect } from "next/navigation";
import { CalendarDays, KeyRound, Palette, User } from "lucide-react";
import { getSession, getCurrentProfile } from "@/lib/session";
import { getAiKeyStatus } from "@/lib/ai/keys";
import { getRank } from "@/lib/xp";
import { AiKeyForm } from "@/components/settings/ai-key-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { SignOutButton } from "@/components/profile/sign-out-button";

export const dynamic = "force-dynamic";

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-border/50 bg-secondary/50">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

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
      <section className="space-y-4 rounded-xl border border-border/50 bg-card p-5">
        <SectionHeader
          icon={User}
          title="Account"
          description="Your identity on NetPrep."
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
      <section className="space-y-4 rounded-xl border border-border/50 bg-card p-5">
        <SectionHeader
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

      {/* AI configuration */}
      <section className="space-y-4">
        <SectionHeader
          icon={KeyRound}
          title="AI Configuration"
          description="Bring your own key to generate custom courses. Stored encrypted — never shown again."
        />
        <AiKeyForm status={status} />
      </section>
    </div>
  );
}
