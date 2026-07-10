import { redirect } from "next/navigation";
import { Flame, Trophy, Zap, BookOpen, Target, Brain, CalendarDays, Award } from "lucide-react";
import { getSession, getCurrentProfile } from "@/lib/session";
import { getProfileStats, getHeatmapData } from "@/lib/data/profile";
import { getLevelProgress, getRank } from "@/lib/xp";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StudyHeatmap } from "@/components/profile/heatmap";
import { SignOutButton } from "@/components/profile/sign-out-button";

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
  const displayName = profile.displayName ?? session.user.name ?? "Explorer";
  const memberSince = new Date(profile.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const statCards = [
    { label: "Current Streak", value: `${profile.currentStreak}d`, icon: Flame, color: "text-np-streak" },
    { label: "Longest Streak", value: `${profile.longestStreak}d`, icon: Flame, color: "text-np-orange" },
    { label: "Total XP", value: profile.xp, icon: Zap, color: "text-np-xp" },
    { label: "Lessons Done", value: stats.lessonsCompleted, icon: BookOpen, color: "text-primary" },
    { label: "Questions", value: stats.totalAttempts, icon: Target, color: "text-np-red" },
    { label: "Accuracy", value: `${stats.accuracy}%`, icon: Award, color: "text-np-success" },
    { label: "Cards Reviewed", value: stats.flashcardsReviewed, icon: Brain, color: "text-np-success" },
    { label: "Active Days", value: stats.studyDays, icon: CalendarDays, color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      {/* Identity */}
      <div className="rounded-2xl border border-border/40 bg-card p-6 md:p-8">
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
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  <Trophy className="h-3 w-3" />
                  {rank}
                </span>
                <span className="rounded-full border border-border/50 bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
                  Level {level}
                </span>
                <span className="text-xs text-muted-foreground">Member since {memberSince}</span>
              </div>
            </div>
          </div>
          <SignOutButton />
        </div>

        {/* Level progress */}
        <div className="mt-6 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Level {level}</span>
            <span>
              {currentLevelXp} / {nextLevelXp} XP to Level {level + 1}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-xl border border-border/50 bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <s.icon className={`h-4 w-4 ${s.color}`} />
              <span className="text-xs font-medium">{s.label}</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Heatmap */}
      <div className="rounded-xl border border-border/50 bg-card p-6">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
          <CalendarDays className="h-4 w-4 text-primary" />
          Study Activity
        </h2>
        <StudyHeatmap days={heatmap} tz={profile.timezone} />
      </div>
    </div>
  );
}
