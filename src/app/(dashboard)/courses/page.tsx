import Link from "next/link";
import {
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Plus,
  Trophy,
  Library,
  Clock,
} from "lucide-react";
import { getCurrentProfile } from "@/lib/session";
import { getCoursesOverview } from "@/lib/data/courses";
import { Stagger, StaggerItem } from "@/components/motion/motion";

export const dynamic = "force-dynamic";

type CourseOverview = Awaited<ReturnType<typeof getCoursesOverview>>[number];

function CourseCard({ course }: { course: CourseOverview }) {
  const pct =
    course.totalLessons > 0
      ? Math.round((course.completedLessons / course.totalLessons) * 100)
      : 0;
  const done = pct === 100 && course.totalLessons > 0;

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group relative flex w-full flex-col gap-4 rounded-xl border border-border/50 bg-card p-5 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
          {course.adaptive ? (
            <Trophy className="h-5 w-5 text-primary" />
          ) : (
            <BookOpen className="h-5 w-5 text-primary" />
          )}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {course.adaptive ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
              <Sparkles className="h-3 w-3" />
              Mastery path
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-np-success/20 bg-np-success/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-np-success">
              Curated
            </span>
          )}
          <span className="rounded-full border border-border/50 bg-secondary px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {course.category}
          </span>
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="font-semibold text-foreground group-hover:text-primary">{course.title}</h3>
        {course.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{course.description}</p>
        )}
      </div>

      <div className="mt-auto space-y-2">
        {!course.adaptive && (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            {course.adaptive ? (
              <>Foundation → Advanced</>
            ) : (
              <>
                {done && <CheckCircle2 className="h-3.5 w-3.5 text-np-success" />}
                {course.completedLessons} / {course.totalLessons} lessons
              </>
            )}
          </span>
          <span className="flex items-center gap-1 font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            {course.enrolled ? "Continue" : "Start"}
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default async function CoursesPage() {
  const profile = await getCurrentProfile();
  const courses = await getCoursesOverview(profile?.id ?? null);

  const mine = profile ? courses.filter((c) => c.ownerId === profile.id) : [];
  const curated = courses.filter((c) => c.ownerId === null);

  return (
    <div className="space-y-10">
      {/* My Courses */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">My Courses</h1>
            <p className="text-sm text-muted-foreground">
              Mastery courses you&apos;ve generated with AI.
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

        {mine.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-card/40 p-10 text-center">
            <Sparkles className="mx-auto mb-3 h-8 w-8 text-primary" />
            <p className="font-medium text-foreground">Create your first course</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Tell NetPrep any subject and it builds a full mastery path — from the absolute basics
              up to advanced — tailored as you learn.
            </p>
            <Link
              href="/courses/new"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Create with AI
            </Link>
          </div>
        ) : (
          <Stagger className="grid gap-4 sm:grid-cols-2">
            {mine.map((course) => (
              <StaggerItem key={course.id} className="flex">
                <CourseCard course={course} />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>

      {/* Catalog */}
      <section className="space-y-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
            <Library className="h-5 w-5 text-np-success" />
            Course Catalog
          </h2>
          <p className="text-sm text-muted-foreground">
            Curated packs by NetPrep — more subjects on the way.
          </p>
        </div>

        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {curated.map((course) => (
            <StaggerItem key={course.id} className="flex">
              <CourseCard course={course} />
            </StaggerItem>
          ))}

          {/* Coming soon placeholder */}
          <StaggerItem className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/50 bg-card/30 p-6 text-center">
            <Clock className="h-6 w-6 text-muted-foreground/60" />
            <p className="text-sm font-medium text-muted-foreground">More courses coming soon</p>
            <p className="text-xs text-muted-foreground/70">
              Can&apos;t wait? Generate any subject above.
            </p>
          </StaggerItem>
        </Stagger>
      </section>
    </div>
  );
}
