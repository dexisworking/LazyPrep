import Link from "next/link";
import { BookOpen, ArrowRight, CheckCircle2, Sparkles, Plus } from "lucide-react";
import { getCurrentProfile } from "@/lib/session";
import { getCoursesOverview } from "@/lib/data/courses";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const profile = await getCurrentProfile();
  const courses = await getCoursesOverview(profile?.id ?? null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Courses</h1>
          <p className="text-sm text-muted-foreground">
            Work through a course lesson by lesson — or generate your own with AI.
          </p>
        </div>
        <Link
          href="/courses/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Create with AI
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-card p-10 text-center text-muted-foreground">
          No courses published yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((course) => {
            const pct =
              course.totalLessons > 0
                ? Math.round((course.completedLessons / course.totalLessons) * 100)
                : 0;
            const done = pct === 100 && course.totalLessons > 0;

            return (
              <Link
                key={course.id}
                href={`/courses/${course.slug}`}
                className="group relative flex flex-col gap-4 rounded-xl border border-border/50 bg-card p-5 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-1.5">
                    {course.aiGenerated && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                        <Sparkles className="h-3 w-3" />
                        AI
                      </span>
                    )}
                    <span className="rounded-full border border-border/50 bg-secondary px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {course.category}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground group-hover:text-primary">
                    {course.title}
                  </h3>
                  {course.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {course.description}
                    </p>
                  )}
                </div>

                <div className="mt-auto space-y-2">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      {done && <CheckCircle2 className="h-3.5 w-3.5 text-np-success" />}
                      {course.completedLessons} / {course.totalLessons} lessons
                    </span>
                    <span className="flex items-center gap-1 font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      {course.enrolled ? "Continue" : "Start"}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
