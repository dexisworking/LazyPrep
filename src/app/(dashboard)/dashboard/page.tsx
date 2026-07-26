import { redirect } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Brain,
  CalendarDays,
  Play,
  RotateCcw,
  Target,
} from "lucide-react";
import { getCurrentProfile } from "@/lib/session";
import { getDashboardData } from "@/lib/data/dashboard";
import { getCourseTree } from "@/lib/data/courses";
import { prisma } from "@/lib/prisma";
import { getLevelProgress, getRank } from "@/lib/xp";
import { computeDailyTarget, daysUntil, formatCountdown } from "@/lib/study-plan";
import { OnboardingTour } from "@/components/onboarding/onboarding-tour";
import { StudyReminder } from "@/components/study-plan/study-reminder";
import { Stagger, StaggerItem } from "@/components/motion/motion";
import { GameButton } from "@/components/game/game-button";
import { GameCard } from "@/components/game/game-card";
import { PlayerCard } from "@/components/game/player-card";
import { ProgressRing } from "@/components/game/progress-ring";
import { StreakCard } from "@/components/game/streak-card";
import { DailyQuests, type Quest } from "@/components/game/daily-quests";
import { XpOrb } from "@/components/game/vectors";

export const dynamic = "force-dynamic";

/** Daily targets. Deliberately small — the point is that they're closeable. */
const QUEST_TARGETS = { lessons: 1, questions: 10, xp: 50 };

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

  const today = data.todaySession;
  const todayLessons = today?.lessonsCompleted ?? 0;
  const todayQuestions = today?.questionsAnswered ?? 0;
  const todayXp = today?.xpEarned ?? 0;
  const goalMet = todayXp > 0 || todayQuestions > 0 || todayLessons > 0;

  const { level, currentLevelXp, nextLevelXp, progress } = getLevelProgress(profile.xp);
  const rank = getRank(level);

  const cp = data.courseProgress;
  const coursePct =
    cp && cp.totalLessons > 0 ? Math.round((cp.completedLessons / cp.totalLessons) * 100) : 0;
  const resumeHref =
    cp?.resumeLessonSlug ? `/courses/${cp.slug}/lessons/${cp.resumeLessonSlug}` : null;

  // Quests are derived from the real session row — nothing here is decorative.
  const quests: Quest[] = [
    { id: "lesson", label: "Complete a lesson", icon: BookOpen, current: todayLessons, target: QUEST_TARGETS.lessons, reward: 20, tone: "gem" },
    { id: "mcq", label: "Answer 10 questions", icon: Target, current: todayQuestions, target: QUEST_TARGETS.questions, reward: 30, tone: "flame" },
    { id: "xp", label: "Earn 50 XP", icon: Brain, current: todayXp, target: QUEST_TARGETS.xp, reward: 25, tone: "xp" },
  ];

  // Daily goal ring = overall completion across the three quests.
  const goalPct = Math.round(
    (quests.reduce((sum, q) => sum + Math.min(1, q.current / q.target), 0) / quests.length) * 100,
  );

  return (
    <div className="space-y-6">
      {!profile.onboardedAt && <OnboardingTour />}

      {/* Player identity — level ring, rank medal, XP bar. */}
      <PlayerCard
        displayName={profile.displayName ?? "Explorer"}
        level={level}
        rank={rank}
        progress={progress}
        currentLevelXp={currentLevelXp}
        nextLevelXp={nextLevelXp}
        totalXp={profile.xp}
      />

      {/* Streak + today's goal ring, side by side. */}
      <div className="grid gap-4 lg:grid-cols-2">
        <StreakCard
          currentStreak={profile.currentStreak}
          longestStreak={profile.longestStreak}
          streakFreezes={profile.streakFreezes ?? 2}
          lastStudyDate={profile.lastStudyDate}
          timezone={profile.timezone}
        />

        <GameCard tone={goalPct === 100 ? "win" : "gem"} className="h-full">
          <div className="flex h-full items-center gap-5">
            <ProgressRing
              value={goalPct}
              size={104}
              thickness={10}
              tone={goalPct === 100 ? "win" : "gem"}
              glow={goalPct === 100}
              label="Daily goal progress"
            >
              <span className="text-2xl font-extrabold tabular-nums text-foreground">
                {goalPct}%
              </span>
              <span className="text-3xs font-bold uppercase tracking-wider text-muted-foreground">
                today
              </span>
            </ProgressRing>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-extrabold tracking-tight text-foreground">
                  Daily goal
                </h2>
                <StudyReminder goalMet={goalMet} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {goalPct === 100
                  ? "All quests cleared. Come back tomorrow."
                  : "Close the ring to bank your streak bonus."}
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                {[
                  { label: "Lessons", value: todayLessons },
                  { label: "Questions", value: todayQuestions },
                  { label: "XP", value: todayXp, orb: true },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl bg-secondary/60 py-2">
                    <p className="flex items-center justify-center gap-1 text-lg font-extrabold tabular-nums text-foreground">
                      {s.orb && <XpOrb size={14} />}
                      {s.value}
                    </p>
                    <p className="text-3xs font-bold uppercase tracking-wider text-muted-foreground">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GameCard>
      </div>

      {/* Quests */}
      <DailyQuests quests={quests} />

      {/* Exam countdown */}
      {examWidget && (
        <GameCard tone="epic">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-game-epic/15">
                <CalendarDays className="h-7 w-7 text-game-epic" />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-extrabold tracking-tight text-foreground">
                  {formatCountdown(examWidget.left)}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {examWidget.title} · {examWidget.lessonsPerDay} lesson
                  {examWidget.lessonsPerDay === 1 ? "" : "s"} today
                  {examWidget.reviewsToday > 0 && (
                    <>
                      {" · "}
                      <RotateCcw className="inline h-3.5 w-3.5 text-game-flame" />{" "}
                      {examWidget.reviewsToday} due
                    </>
                  )}
                </p>
              </div>
            </div>
            <GameButton tone="epic" size="sm" href={`/courses/${examWidget.slug}`} iconRight={ArrowRight}>
              Study now
            </GameButton>
          </div>
        </GameCard>
      )}

      {/* Continue learning — the primary action of the screen. */}
      {cp && (
        <GameCard tone="neutral">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0 space-y-2">
              <span className="text-2xs font-extrabold uppercase tracking-[0.14em] text-primary">
                Continue learning
              </span>
              <h2 className="text-xl font-extrabold tracking-tight text-balance text-foreground">
                {cp.title}
              </h2>
              {cp.resumeLessonTitle ? (
                <p className="text-sm text-muted-foreground">
                  {coursePct === 100 ? "Review: " : "Up next: "}
                  <span className="font-semibold text-foreground">{cp.resumeLessonTitle}</span>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">No lessons available yet.</p>
              )}
              <div className="flex items-center gap-2 pt-1">
                <div className="h-2.5 w-40 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-(--dur-slow) ease-emphasized motion-reduce:transition-none"
                    style={{ width: `${coursePct}%` }}
                  />
                </div>
                <span className="text-xs font-bold tabular-nums text-muted-foreground">
                  {cp.completedLessons}/{cp.totalLessons}
                </span>
              </div>
            </div>
            {resumeHref && (
              <GameButton tone="primary" size="lg" href={resumeHref} icon={Play}>
                {cp.completedLessons > 0 ? "Resume" : "Start"}
              </GameButton>
            )}
          </div>
        </GameCard>
      )}

      {/*
        Not enrolled in anything yet. This slot used to render the oldest
        curated course as "Continue learning", which presented a course the user
        had never chosen as one they were already taking. It's an invitation
        now, and enrolling is an explicit action on the course page.
      */}
      {!cp && (
        <GameCard tone="gem">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0 space-y-2">
              <span className="text-2xs font-extrabold uppercase tracking-[0.14em] text-primary">
                Get started
              </span>
              <h2 className="text-xl font-extrabold tracking-tight text-balance text-foreground">
                You&apos;re not enrolled in a course yet
              </h2>
              <p className="text-sm text-muted-foreground">
                {data.suggestedCourse ? (
                  <>
                    Browse the curated library —{" "}
                    <span className="font-semibold text-foreground">
                      {data.suggestedCourse.title}
                    </span>{" "}
                    is a good place to start — or generate your own with an AI key.
                  </>
                ) : (
                  <>Generate a course for any subject with your own AI key.</>
                )}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <GameButton tone="primary" size="lg" href="/courses" icon={BookOpen}>
                Browse courses
              </GameButton>
            </div>
          </div>
        </GameCard>
      )}

      {/* Jump back in */}
      <Stagger className="grid grid-cols-1 gap-4 xs:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/courses", label: "Courses", icon: BookOpen, tone: "gem" as const },
          { href: "/practice", label: "Practice", icon: Target, tone: "flame" as const },
          { href: "/flashcards", label: "Flashcards", icon: Brain, tone: "win" as const },
          { href: "/bookmarks", label: "Bookmarks", icon: CalendarDays, tone: "xp" as const },
        ].map((a) => (
          <StaggerItem key={a.href}>
            <GameButton tone={a.tone} href={a.href} icon={a.icon} full size="md">
              {a.label}
            </GameButton>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
