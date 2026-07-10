import Link from "next/link";
import { Target, ArrowRight, BookOpenCheck, CheckCircle2, AlarmClock } from "lucide-react";
import { getCurrentProfile } from "@/lib/session";
import { getPracticeOverview } from "@/lib/data/practice";
import { Stagger, StaggerItem } from "@/components/motion/motion";

export const dynamic = "force-dynamic";

export default async function PracticePage() {
  const profile = await getCurrentProfile();
  const courses = await getPracticeOverview(profile?.id ?? null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Practice</h1>
        <p className="text-sm text-muted-foreground">
          Sharpen your knowledge with MCQs and timed AI mock tests. Every answer earns XP;
          mistakes go to your notebook.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-card p-10 text-center text-muted-foreground">
          No practice questions available yet.
        </div>
      ) : (
        <Stagger className="grid gap-4">
          {courses.map((course) => (
            <StaggerItem
              key={course.id}
              className="rounded-xl border border-border/50 bg-card p-5"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-np-red/20 bg-np-red/10">
                    <Target className="h-5 w-5 text-np-red" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground">{course.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {course.totalQuestions} questions · {course.answered} attempted
                      {course.attempts > 0 && ` · ${course.accuracy}% accuracy`}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {course.wrong > 0 && (
                    <Link
                      href={`/practice/${course.slug}/notebook`}
                      className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                    >
                      <BookOpenCheck className="h-4 w-4 text-np-red" />
                      Notebook ({course.wrong})
                    </Link>
                  )}
                  <Link
                    href={`/practice/${course.slug}/mocks`}
                    className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary/20"
                  >
                    <AlarmClock className="h-4 w-4" />
                    Mock Tests
                  </Link>
                  {course.totalQuestions > 0 && (
                    <Link
                      href={`/practice/${course.slug}`}
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
                    >
                      Start Practice
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>

              {course.attempts > 0 && (
                <div className="mt-4 flex items-center gap-4 border-t border-border/40 pt-4 text-sm">
                  <span className="flex items-center gap-1.5 text-np-success">
                    <CheckCircle2 className="h-4 w-4" />
                    {course.correct} correct
                  </span>
                  <span className="text-muted-foreground">{course.attempts} total attempts</span>
                </div>
              )}
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}
