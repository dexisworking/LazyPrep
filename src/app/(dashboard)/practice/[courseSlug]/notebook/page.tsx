import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, CheckCircle2, XCircle, BookOpenCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/session";
import { getWrongAnswers } from "@/lib/data/practice";
import { canAccessCourse } from "@/lib/data/courses";
import { TutorPanel } from "@/components/tutor/tutor-panel";

export const dynamic = "force-dynamic";

export default async function NotebookPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const course = await prisma.course.findUnique({ where: { slug: courseSlug } });
  if (!course) notFound();

  const profile = await getCurrentProfile();
  if (!canAccessCourse(course, profile?.id ?? null)) notFound();

  const wrong = await getWrongAnswers(courseSlug, profile?.id ?? null);

  return (
    <div className="space-y-6">
      <Link
        href="/practice"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Practice
      </Link>

      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
          <BookOpenCheck className="h-6 w-6 text-np-red" />
          Wrong Answer Notebook
        </h1>
        <p className="text-sm text-muted-foreground">
          Questions you missed on your last attempt. Answer them correctly in practice to clear them.
        </p>
      </div>

      {wrong.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-card p-10 text-center">
          <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-np-success" />
          <p className="font-medium text-foreground">Nothing to review!</p>
          <p className="text-sm text-muted-foreground">
            You have no outstanding mistakes for {course.title}.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {wrong.map((q) => (
            <div key={q.id} className="space-y-4 rounded-xl border border-border/50 bg-card p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                  {q.topic}
                </span>
                <span className="rounded-full border border-border/50 bg-secondary px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {q.difficulty}
                </span>
                {profile && (
                  <span className="ml-auto">
                    <TutorPanel
                      courseId={course.id}
                      questionId={q.id}
                      trigger="inline"
                      label="Ask why"
                      seedPrompt="Why is my answer wrong, and how should I reason to the correct one?"
                    />
                  </span>
                )}
              </div>

              <p className="font-medium text-foreground">{q.text}</p>

              <div className="space-y-2">
                {q.options.map((option, i) => {
                  const isCorrect = i === q.correctIdx;
                  const isYourWrong = i === q.selectedIdx && !isCorrect;
                  return (
                    <div
                      key={i}
                      className={
                        "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm " +
                        (isCorrect
                          ? "border-np-success/40 bg-np-success/10 text-foreground"
                          : isYourWrong
                            ? "border-destructive/40 bg-destructive/10 text-foreground"
                            : "border-border/40 text-muted-foreground")
                      }
                    >
                      {isCorrect ? (
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-np-success" />
                      ) : isYourWrong ? (
                        <XCircle className="h-4 w-4 flex-shrink-0 text-destructive" />
                      ) : (
                        <span className="h-4 w-4 flex-shrink-0" />
                      )}
                      <span>{option}</span>
                      {isYourWrong && (
                        <span className="ml-auto text-xs font-medium text-destructive">Your answer</span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="rounded-lg border border-border/40 bg-secondary/40 p-3 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Why: </span>
                {q.explanation}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
