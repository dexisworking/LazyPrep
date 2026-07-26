import Link from "next/link";
import { redirect } from "next/navigation";
import { Flame, Trophy, Zap, BookOpen, Target, Brain, CalendarDays, Award, Settings, Shield } from "lucide-react";
import { getSession, getCurrentProfile } from "@/lib/session";
import { getProfileStats, getHeatmapData } from "@/lib/data/profile";
import { getLevelProgress, getRank, getStreakMultiplier } from "@/lib/xp";
import { getStreakStatus, getStreakStatusLabel } from "@/lib/streak";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StudyHeatmap } from "@/components/profile/heatmap";
import { AnalyticsExpandable } from "@/components/profile/analytics-expandable";
import { SignOutButton } from "@/components/profile/sign-out-button";
import { Stagger, StaggerItem } from "@/components/motion/motion";
import { Pill } from "@/components/shared/pill";
import { ProgressBar } from "@/components/shared/progress-bar";
import { SectionHeader } from "@/components/shared/section-header";
import { StatTile } from "@/components/shared/stat-tile";
import { STREAK_TONE } from "@/components/shared/streak-flame";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getSession();
  const profile = await getCurrentProfile();
  if (!session?.user || !profile) redirect("/sign-in");

  const [stats, heatmap] = await Promise.all([
    getProfileStats(profile.id),
    getHeatmapData(profile.id, profile.timezone),
  ]);

  const { level, currentLevelXp, nextLevelXp, progress } = getLevelProgress(profile.xp);
  const rank = getRank(level);
  const streakStatus = getStreakStatus(profile.currentStreak);
  const streakStatusLabel = getStreakStatusLabel(streakStatus);
  const xpMultiplier = getStreakMultiplier(profile.currentStreak);
  const displayName = profile.displayName ?? session.user.name ?? "Explorer";
  const memberSince = new Date(profile.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Tone for the current-streak tile comes from the shared ramp, not a fifth
  // hand-maintained copy of the amber/orange/red ladder.
  const streakTone = STREAK_TONE[streakStatus];

  const statCards = [
    { label: "Current Streak", value: `${profile.currentStreak}d`, icon: Flame, tone: "streak" as const, cardClass: cn(streakTone.ring, streakTone.bg) },
    { label: "Longest Streak", value: `${profile.longestStreak}d`, icon: Flame, tone: "orange" as const, cardClass: "" },
    { label: "XP Multiplier", value: `${xpMultiplier}×`, icon: Zap, tone: "xp" as const, cardClass: xpMultiplier > 1 ? "border-np-xp/30 bg-np-xp/5" : "" },
    { label: "Streak Freezes", value: profile.streakFreezes ?? 2, icon: Shield, tone: "primary" as const, cardClass: "" },
    { label: "Total XP", value: profile.xp, icon: Zap, tone: "xp" as const, cardClass: "" },
    { label: "Lessons Done", value: stats.lessonsCompleted, icon: BookOpen, tone: "primary" as const, cardClass: "" },
    { label: "Questions", value: stats.totalAttempts, icon: Target, tone: "red" as const, cardClass: "" },
    { label: "Accuracy", value: `${stats.accuracy}%`, icon: Award, tone: "success" as const, cardClass: "" },
    { label: "Cards Reviewed", value: stats.flashcardsReviewed, icon: Brain, tone: "success" as const, cardClass: "" },
    { label: "Active Days", value: stats.studyDays, icon: CalendarDays, tone: "primary" as const, cardClass: "" },
  ];

  return (
    <div className="space-y-6">
      {/* Identity */}
      <div className="rounded-card border border-border-subtle bg-card p-6 md:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border border-border">
              {session.user.image && <AvatarImage src={session.user.image} alt={displayName} />}
              <AvatarFallback className="bg-primary/10 text-lg font-bold uppercase text-primary">
                {displayName.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{displayName}</h1>
              <p className="text-sm text-muted-foreground">{session.user.email}</p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Pill tone="primary" icon={Trophy}>
                  {rank}
                </Pill>
                <Pill tone="muted">Level {level}</Pill>
                <span className="text-xs text-muted-foreground">Member since {memberSince}</span>
              </div>
            </div>
          </div>
          {/* Settings lives in the sidebar on desktop; on mobile (no sidebar) it
              lives here in the profile section. */}
          <div className="flex items-center gap-2">
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 rounded-control border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted md:hidden"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <SignOutButton />
          </div>
        </div>

        {/* Level progress */}
        <ProgressBar
          value={progress}
          size="md"
          className="mt-6"
          aria-label={`Level ${level} progress`}
          label={<span>Level {level}</span>}
          hint={
            <span className="tabular-nums">
              {currentLevelXp} / {nextLevelXp} XP to Level {level + 1}
            </span>
          }
        />
      </div>

      {/* Stats */}
      <Stagger className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {statCards.map((s) => (
          <StaggerItem key={s.label}>
            <StatTile
              label={s.label}
              value={s.value}
              icon={s.icon}
              tone={s.tone}
              size="sm"
              className={s.cardClass || undefined}
            />
          </StaggerItem>
        ))}
      </Stagger>

      {/* Heatmap */}
      <div className="rounded-card border border-border-subtle bg-card p-6">
        <SectionHeader as="h2" size="sm" icon={CalendarDays} title="Study Activity" className="mb-4" />
        <StudyHeatmap days={heatmap} tz={profile.timezone} />
      </div>

      {/* Expandable Analytics */}
      <AnalyticsExpandable
        accuracy={stats.accuracy}
        totalAttempts={stats.totalAttempts}
        correctAttempts={stats.correctAttempts}
        studyDays={stats.studyDays}
      />
    </div>
  );
}
