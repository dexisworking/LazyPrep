import Link from "next/link";
import { redirect } from "next/navigation";
import { Zap, Play, Flame, Trophy, Target, BookOpen, TrendingUp, CheckCircle2, CalendarDays, RotateCcw } from "lucide-react";
import { getCurrentProfile } from "@/lib/session";
import { getDashboardData } from "@/lib/data/dashboard";
import { getCourseTree } from "@/lib/data/courses";
import { prisma } from "@/lib/prisma";
import { getLevelProgress, getRank } from "@/lib/xp";
import { computeDailyTarget, daysUntil, formatCountdown } from "@/lib/study-plan";
import { AnimatedNumber, Stagger, StaggerItem } from "@/components/motion/motion";
import { OnboardingTour } from "@/components/onboarding/onboarding-tour";
import { StudyReminder } from "@/components/study-plan/study-reminder";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/sign-in");

  const data = await getDashboardData(profile);

  // Nearest upcoming exam (if the user set one) → countdown + today's target.
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const nextPlan = await prisma.studyPlan.findFirst({
    where: { profileId: profile.id, examDate: { gte: startOfToday } },
    orderBy: { examDate: "asc" },
    include: { course: { select: { slug: true, title: true } } },
  });
  let examWidget: {
    title: string;
    slug: string;
    left: number;
    lessonsPerDay: number;
    reviewsToday: number;
  } | null = null;
  if (nextPlan?.examDate) {
    const [tree, due] = await Promise.all([
      getCourseTree(nextPlan.course.slug, profile.id),
      prisma.questionReview.count({
        where: { profileId: profile.id, dueDate: { lte: new Date() }, question: { courseId: nextPlan.courseId } },
      }),
    ]);
    const remaining = tree ? Math.max(0, tree.totalLessons - tree.completedLessons) : 0;
    const left = daysUntil(nextPlan.examDate);
    const target = computeDailyTarget(remaining, due, left);
    examWidget = {
      title: nextPlan.course.title,
      slug: nextPlan.course.slug,
      left,
      lessonsPerDay: target.lessonsPerDay,
      reviewsToday: target.reviewsToday,
    };
  }

  const goalMet =
    (data.todaySession?.xpEarned ?? 0) > 0 ||
    (data.todaySession?.questionsAnswered ?? 0) > 0 ||
    (data.todaySession?.lessonsCompleted ?? 0) > 0;
  const { level, currentLevelXp, nextLevelXp, progress } = getLevelProgress(profile.xp);
  const rank = getRank(level);

  const cp = data.courseProgress;
  const coursePct =
    cp && cp.totalLessons > 0 ? Math.round((cp.completedLessons / cp.totalLessons) * 100) : 0;
  const resumeHref =
    cp?.resumeLessonSlug ? `/courses/${cp.slug}/lessons/${cp.resumeLessonSlug}` : null;

  const stats = [
    { label: "Day Streak", value: profile.currentStreak, suffix: "", icon: Flame, color: "text-np-streak" },
    { label: "Total XP", value: profile.xp, suffix: "", icon: Zap, color: "text-np-xp" },
    { label: "Course Progress", value: coursePct, suffix: "%", icon: BookOpen, color: "text-primary" },
    { label: "MCQ Accuracy", value: data.accuracy, suffix: "%", icon: Target, color: "text-np-red" },
  ];

  return (
    <div className="space-y-8">
      {!profile.onboardedAt && <OnboardingTour />}

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
      <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <StaggerItem key={s.label} className="rounded-xl border border-border/50 bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <s.icon className={`h-4 w-4 ${s.color}`} />
              <span className="text-xs font-medium">{s.label}</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">
              <AnimatedNumber value={s.value} suffix={s.suffix} />
            </p>
          </StaggerItem>
        ))}
      </Stagger>

      {/* Next exam countdown */}
      {examWidget && (
        <Link
          href={`/courses/${examWidget.slug}`}
          className="group flex flex-col gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-5 transition-colors hover:border-primary/50 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                {formatCountdown(examWidget.left)} · {examWidget.title}
              </p>
              <p className="text-sm text-muted-foreground">
                Today&apos;s target: {examWidget.lessonsPerDay} lesson
                {examWidget.lessonsPerDay === 1 ? "" : "s"}
                {examWidget.reviewsToday > 0 && (
                  <>
                    {" "}
                    · <RotateCcw className="inline h-3.5 w-3.5 text-np-orange" />{" "}
                    {examWidget.reviewsToday} review{examWidget.reviewsToday === 1 ? "" : "s"} due
                  </>
                )}
              </p>
            </div>
          </div>
          <span className="text-sm font-semibold text-primary transition-transform group-hover:translate-x-0.5">
            Study now →
          </span>
        </Link>
      )}

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
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <TrendingUp className="h-4 w-4 text-np-success" />
              Today
            </h3>
            <StudyReminder goalMet={goalMet} />
          </div>
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
