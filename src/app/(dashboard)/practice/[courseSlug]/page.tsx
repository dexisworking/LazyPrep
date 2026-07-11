import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/session";
import { getQuizQuestions } from "@/lib/data/practice";
import { canAccessCourse } from "@/lib/data/courses";
import { PracticeSession } from "@/components/practice/practice-session";
import { PracticeBankGenerator } from "@/components/practice/practice-bank-generator";

export const dynamic = "force-dynamic";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const course = await prisma.course.findUnique({ where: { slug: courseSlug } });
  if (!course) notFound();

  const profile = await getCurrentProfile();
  if (!canAccessCourse(course, profile?.id ?? null)) notFound();

  // First visit to an AI course's practice tab with no bank yet → auto-generate.
  const questionCount = await prisma.question.count({ where: { courseId: course.id } });
  const canAutoGen =
    questionCount === 0 && course.aiGenerated && profile?.id === course.ownerId;

  const questions = canAutoGen
    ? []
    : await getQuizQuestions(courseSlug, profile?.id ?? null, 10);

  return (
    <div className="space-y-6">
      <Link
        href="/practice"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Practice
      </Link>
      {canAutoGen ? (
        <PracticeBankGenerator courseId={course.id} />
      ) : (
        <PracticeSession
          questions={questions}
          notebookHref={`/practice/${courseSlug}/notebook`}
        />
      )}
    </div>
  );
}
