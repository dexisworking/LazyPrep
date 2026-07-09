import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/session";
import { getQuizQuestions } from "@/lib/data/practice";
import { canAccessCourse } from "@/lib/data/courses";
import { PracticeSession } from "@/components/practice/practice-session";

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

  const questions = await getQuizQuestions(courseSlug, profile?.id ?? null, 10);

  return (
    <div className="space-y-6">
      <Link
        href="/practice"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Practice
      </Link>
      <PracticeSession
        questions={questions}
        notebookHref={`/practice/${courseSlug}/notebook`}
      />
    </div>
  );
}
