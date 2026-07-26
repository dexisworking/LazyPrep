import Link from "next/link";
import { redirect } from "next/navigation";
import { Zap, Play, Trophy, Target, BookOpen, TrendingUp, CheckCircle2, CalendarDays, RotateCcw, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCurrentProfile } from "@/lib/session";
import { getDashboardData } from "@/lib/data/dashboard";
import { getCourseTree } from "@/lib/data/courses";
import { prisma } from "@/lib/prisma";
import { getLevelProgress, getRank } from "@/lib/xp";
import { computeDailyTarget, daysUntil, formatCountdown } from "@/lib/study-plan";
import { Stagger, StaggerItem } from "@/components/motion/motion";
import { OnboardingTour } from "@/components/onboarding/onboarding-tour";
import { StudyReminder } from "@/components/study-plan/study-reminder";
import { StreakCard } from "@/components/shared/streak-card";
import { Pill } from "@/components/shared/pill";
import { ProgressBar } from "@/components/shared/progress-bar";
import { SectionHeader } from "@/components/shared/section-header";
import { StatTile } from "@/components/shared/stat-tile";
import { Button } from "@/components/ui/button";

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
    { label: "Total XP", value: profile.xp, suffix: "", icon: Zap, tone: "xp" as const },
    { label: "Course Progress", value: coursePct, suffix: "%", icon: BookOpen, tone: "primary" as const },
    { label: "MCQ Accuracy", value: data.accuracy, suffix: "%", icon: Target, tone: "red" as const },
  ];

  return (
    <div className="space-y-8">
      {!profile.onboardedAt && <OnboardingTour />}

      {/* Welcome hero */}
      <div className="relative overflow-hidden rounded-card border border-border-subtle bg-card p-6 md:p-8">
        {/*
         * Ambient glow. Was `-z-10`, which put it behind the parent's own
         * bg-card in the same stacking context — it never painted. Sits at the
         * base layer now with the content lifted above it.
         */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary/15 blur-3xl"
        />
        <div className="relative z-10 space-y-4">
          <Pill tone="primary" icon={Trophy}>
            {rank} · Level {level}
          </Pill>
          {/* Steps down on small screens — 30px wrapped to three lines at 360px. */}
          <h1 className="text-2xl font-bold tracking-tight text-balance text-foreground sm:text-3xl">
            Welcome back, {profile.displayName}
          </h1>

          <ProgressBar
            value={progress}
            size="md"
            className="max-w-md"
            aria-label={`Level ${level} progress`}
            label={<span>Level {level}</span>}
            hint={
              <span className="tabular-nums">
                {currentLevelXp} / {nextLevelXp} XP to Level {level + 1}
              </span>
            }
          />
        </div>
      </div>

      {/* Streak card */}
      <StreakCard
        currentStreak={profile.currentStreak}
        longestStreak={profile.longestStreak}
        streakFreezes={profile.streakFreezes ?? 2}
        lastStudyDate={profile.lastStudyDate}
        timezone={profile.timezone}
      />

      {/* Stat cards — one column at 360px, where three p-4 tiles left ~101px each */}
      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <StaggerItem key={s.label}>
            <StatTile
              label={s.label}
              value={s.value}
              suffix={s.suffix}
              icon={s.icon}
              tone={s.tone}
            />
          </StaggerItem>
        ))}
      </Stagger>

      {/* Next exam countdown */}
      {examWidget && (
        <Link
          href={`/courses/${examWidget.slug}`}
          className="group flex flex-col gap-4 rounded-card border border-primary/30 bg-primary/5 p-card transition-colors duration-(--dur-fast) hover:border-primary/50 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-control border border-primary/20 bg-primary/10">
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
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
            Study now
            <ArrowRight className="h-4 w-4 transition-transform duration-(--dur-fast) group-hover:translate-x-0.5" />
          </span>
        </Link>
      )}

      {/* Continue learning.
          Flat `bg-card`, not the old `bg-gradient-to-br from-card to-card/60` —
          a card→card/60 wash was invisible against its neighbours and was the
          one card on the screen breaking the pattern. */}
      {cp && (
        <div className="rounded-card border border-border-subtle bg-card p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <span className="text-2xs font-semibold uppercase tracking-wider text-primary">
                Continue Learning
              </span>
              <h2 className="text-xl font-semibold text-balance text-foreground">{cp.title}</h2>
              {cp.resumeLessonTitle ? (
                <p className="text-sm text-muted-foreground">
                  {coursePct === 100 ? "Review: " : "Up next: "}
                  <span className="text-foreground">{cp.resumeLessonTitle}</span>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">No lessons available yet.</p>
              )}
              <div className="flex items-center gap-2 pt-1">
                <ProgressBar
                  value={coursePct}
                  className="w-40"
                  aria-label={`${cp.title} progress`}
                />
                <span className="text-xs tabular-nums text-muted-foreground">
                  {cp.completedLessons}/{cp.totalLessons}
                </span>
              </div>
            </div>
            {resumeHref && (
              <Button size="lg" render={<Link href={resumeHref} />}>
                <Play />
                {cp.completedLessons > 0 ? "Resume" : "Start"}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Today + quick actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-card border border-border-subtle bg-card p-card">
          <SectionHeader
            as="h2"
            size="sm"
            title="Today"
            icon={TrendingUp}
            action={<StudyReminder goalMet={goalMet} />}
            className="mb-4"
          />
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Lessons", value: data.todaySession?.lessonsCompleted ?? 0, tone: "" },
              { label: "Questions", value: data.todaySession?.questionsAnswered ?? 0, tone: "" },
              {
                label: "XP today",
                value: data.todaySession?.xpEarned ?? 0,
                tone: "text-np-xp",
                prefix: "+",
              },
            ].map((t) => (
              <div key={t.label}>
                <p className={cn("text-xl font-bold tabular-nums text-foreground", t.tone)}>
                  {t.prefix}
                  {t.value}
                </p>
                <p className="text-xs text-muted-foreground">{t.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-card border border-border-subtle bg-card p-card">
          <SectionHeader
            as="h2"
            size="sm"
            title="Jump back in"
            icon={CheckCircle2}
            className="mb-4"
          />
          {/* Stacks at 360px rather than squeezing two labelled targets side by side. */}
          <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
            {[
              { href: "/courses", label: "Courses", icon: BookOpen, tone: "text-accent" },
              { href: "/practice", label: "Practice", icon: Target, tone: "text-np-red" },
            ].map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="flex items-center gap-2 rounded-control border border-border-subtle bg-secondary/40 px-3 py-2.5 text-sm font-medium text-foreground transition-colors duration-(--dur-fast) hover:border-primary/40 hover:bg-secondary"
              >
                <a.icon className={cn("h-4 w-4", a.tone)} />
                {a.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
