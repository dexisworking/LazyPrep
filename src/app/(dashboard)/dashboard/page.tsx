import Link from "next/link";
import { redirect } from "next/navigation";
import { Zap, Play, Flame, Trophy, Target, BookOpen, TrendingUp, CheckCircle2 } from "lucide-react";
import { getCurrentProfile } from "@/lib/session";
import { getDashboardData } from "@/lib/data/dashboard";
import { getLevelProgress, getRank } from "@/lib/xp";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/sign-in");

  const data = await getDashboardData(profile);
  const { level, currentLevelXp, nextLevelXp, progress } = getLevelProgress(profile.xp);
  const rank = getRank(level);

  const cp = data.courseProgress;
  const coursePct =
    cp && cp.totalLessons > 0 ? Math.round((cp.completedLessons / cp.totalLessons) * 100) : 0;
  const resumeHref =
    cp?.resumeLessonSlug ? `/courses/${cp.slug}/lessons/${cp.resumeLessonSlug}` : null;

  const stats = [
    { label: "Day Streak", value: profile.currentStreak, icon: Flame, color: "text-np-streak" },
    { label: "Total XP", value: profile.xp, icon: Zap, color: "text-np-xp" },
    { label: "Course Progress", value: `${coursePct}%`, icon: BookOpen, color: "text-primary" },
    { label: "MCQ Accuracy", value: `${data.accuracy}%`, icon: Target, color: "text-np-red" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome hero */}
      <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card p-6 md:p-8">
        <div className="absolute right-0 top-0 -z-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Trophy className="h-3.5 w-3.5" />
            {rank} · Level {level}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {profile.displayName}
          </h1>

          {/* Level progress */}
          <div className="max-w-md space-y-1.5">
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
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border/50 bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <s.icon className={`h-4 w-4 ${s.color}`} />
              <span className="text-xs font-medium">{s.label}</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Continue learning */}
      {cp && (
        <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-card to-card/60 p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <span className="text-xs font-medium uppercase tracking-wide text-primary">
                Continue Learning
              </span>
              <h2 className="text-xl font-semibold text-foreground">{cp.title}</h2>
              {cp.resumeLessonTitle ? (
                <p className="text-sm text-muted-foreground">
                  {coursePct === 100 ? "Review: " : "Up next: "}
                  <span className="text-foreground">{cp.resumeLessonTitle}</span>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">No lessons available yet.</p>
              )}
              <div className="flex items-center gap-2 pt-1">
                <div className="h-1.5 w-40 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${coursePct}%` }} />
                </div>
                <span className="text-xs text-muted-foreground">
                  {cp.completedLessons}/{cp.totalLessons}
                </span>
              </div>
            </div>
            {resumeHref && (
              <Link
                href={resumeHref}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
              >
                <Play className="h-4 w-4" />
                {cp.completedLessons > 0 ? "Resume" : "Start"}
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Today + quick actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <TrendingUp className="h-4 w-4 text-np-success" />
            Today
          </h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xl font-bold text-foreground">{data.todaySession?.lessonsCompleted ?? 0}</p>
              <p className="text-xs text-muted-foreground">Lessons</p>
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{data.todaySession?.questionsAnswered ?? 0}</p>
              <p className="text-xs text-muted-foreground">Questions</p>
            </div>
            <div>
              <p className="text-xl font-bold text-np-xp">+{data.todaySession?.xpEarned ?? 0}</p>
              <p className="text-xs text-muted-foreground">XP today</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            Jump back in
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/courses"
              className="flex items-center gap-2 rounded-lg border border-border/50 bg-background px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-secondary/50"
            >
              <BookOpen className="h-4 w-4 text-accent" />
              Courses
            </Link>
            <Link
              href="/practice"
              className="flex items-center gap-2 rounded-lg border border-border/50 bg-background px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-secondary/50"
            >
              <Target className="h-4 w-4 text-np-red" />
              Practice
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
