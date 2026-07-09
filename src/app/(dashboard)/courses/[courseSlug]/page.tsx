import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Circle, Clock, ChevronLeft, Sparkles } from "lucide-react";
import { getCurrentProfile } from "@/lib/session";
import { getCourseTree, canAccessCourse } from "@/lib/data/courses";
import { getAdaptiveCourse } from "@/lib/data/adaptive";
import { prisma } from "@/lib/prisma";
import { StartCourseButton } from "@/components/courses/start-course-button";
import { AdaptiveCourse } from "@/components/adaptive/adaptive-course";

export const dynamic = "force-dynamic";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const profile = await getCurrentProfile();
  const tree = await getCourseTree(courseSlug, profile?.id ?? null);
  if (!tree || !canAccessCourse(tree.course, profile?.id ?? null)) notFound();

  const { course, modules, totalLessons, completedLessons, resumeLesson } = tree;
  const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const enrolled = profile
    ? Boolean(
        await prisma.enrollment.findUnique({
          where: { profileId_courseId: { profileId: profile.id, courseId: course.id } },
        }),
      )
    : false;

  const resumeHref = resumeLesson
    ? `/courses/${course.slug}/lessons/${resumeLesson.slug}`
    : null;

  const adaptive = course.adaptive
    ? await getAdaptiveCourse(courseSlug, profile?.id ?? null)
    : null;
  const phasesMastered = adaptive?.phases.filter((p) => p.checkpoint?.passed).length ?? 0;

  return (
    <div className="space-y-8">
      <Link
        href="/courses"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        All courses
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-border/40 bg-card p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {course.adaptive && (
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                  <Sparkles className="h-3 w-3" />
                  Mastery path
                </span>
              )}
              <span className="inline-block rounded-full border border-border/50 bg-secondary px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {course.category}
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{course.title}</h1>
            {course.description && (
              <p className="max-w-xl text-muted-foreground">{course.description}</p>
            )}
            <div className="flex items-center gap-4 pt-1 text-sm text-muted-foreground">
              {course.adaptive ? (
                <span className="font-semibold text-primary">
                  {phasesMastered} of 3 phases mastered
                </span>
              ) : (
                <>
                  <span>
                    <span className="font-semibold text-foreground">{completedLessons}</span> / {totalLessons} lessons
                  </span>
                  <span className="font-semibold text-primary">{pct}% complete</span>
                </>
              )}
            </div>
          </div>
          {resumeHref && (
            <StartCourseButton courseId={course.id} lessonHref={resumeHref} enrolled={enrolled} />
          )}
        </div>
        <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${course.adaptive ? Math.round((phasesMastered / 3) * 100) : pct}%` }}
          />
        </div>
      </div>

      {/* Adaptive phases OR flat module tree */}
      {course.adaptive && adaptive ? (
        <AdaptiveCourse courseSlug={course.slug} phases={adaptive.phases} />
      ) : (
      <div className="space-y-8">
        {modules.map((mod) => (
          <section key={mod.id} className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">{mod.title}</h2>
            <div className="space-y-5">
              {mod.chapters.map((chapter) => (
                <div key={chapter.id} className="space-y-2">
                  <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                    {chapter.title}
                  </h3>
                  <ul className="overflow-hidden rounded-xl border border-border/50 bg-card">
                    {chapter.lessons.map((lesson) => (
                      <li key={lesson.id} className="border-b border-border/40 last:border-0">
                        <Link
                          href={`/courses/${course.slug}/lessons/${lesson.slug}`}
                          className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-secondary/60"
                        >
                          {lesson.completed ? (
                            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-np-success" />
                          ) : (
                            <Circle className="h-5 w-5 flex-shrink-0 text-muted-foreground/40" />
                          )}
                          <span
                            className={
                              lesson.completed
                                ? "flex-1 text-sm text-muted-foreground"
                                : "flex-1 text-sm text-foreground"
                            }
                          >
                            {lesson.title}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {lesson.estimatedMinutes}m
                          </span>
                        </Link>
                      </li>
                    ))}
                    {chapter.lessons.length === 0 && (
                      <li className="px-4 py-3 text-sm text-muted-foreground">No lessons yet.</li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      )}
    </div>
  );
}
