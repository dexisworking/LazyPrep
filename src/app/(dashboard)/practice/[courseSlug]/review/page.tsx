import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, RotateCcw } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/session";
import { getReviewQuestions } from "@/lib/data/practice";
import { canAccessCourse } from "@/lib/data/courses";
import { PracticeSession } from "@/components/practice/practice-session";

export const dynamic = "force-dynamic";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const course = await prisma.course.findUnique({ where: { slug: courseSlug } });
  if (!course) notFound();

  const profile = await getCurrentProfile();
  if (!canAccessCourse(course, profile?.id ?? null)) notFound();

  const questions = await getReviewQuestions(courseSlug, profile?.id ?? null, 15);

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
          <RotateCcw className="h-6 w-6 text-np-orange" />
          Review — {course.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          Questions resurfacing right when you&apos;re about to forget them. Answer to reschedule each
          for its next review.
        </p>
      </div>

      {questions.length === 0 ? (
        <div className="rounded-2xl border border-border/40 bg-card p-10 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-np-success/10">
            <RotateCcw className="h-7 w-7 text-np-success" />
          </div>
          <p className="font-medium text-foreground">Nothing due right now</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Spaced repetition will resurface questions here when it&apos;s time. Keep practicing to
            build the queue.
          </p>
          <Link
            href={`/practice/${courseSlug}`}
            className="mt-4 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
          >
            Practice new questions
          </Link>
        </div>
      ) : (
        <PracticeSession questions={questions} notebookHref={`/practice/${courseSlug}/notebook`} />
      )}
    </div>
  );
}
