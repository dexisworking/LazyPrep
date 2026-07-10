import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getCurrentProfile } from "@/lib/session";
import { getMockTestAttemptReview } from "@/lib/data/mock-tests";
import { AttemptReview } from "@/components/mock-tests/attempt-review";

export const dynamic = "force-dynamic";

export default async function MockAttemptReviewPage({
  params,
}: {
  params: Promise<{ courseSlug: string; testId: string; attemptId: string }>;
}) {
  const { courseSlug, attemptId } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect("/sign-in");

  const review = await getMockTestAttemptReview(attemptId, profile.id);
  if (!review || review.courseSlug !== courseSlug) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href={`/practice/${review.courseSlug}/mocks`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Mock Tests
      </Link>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{review.testTitle}</h1>
        <p className="text-sm text-muted-foreground">
          {review.courseTitle}
          {review.completedAt &&
            ` · ${review.completedAt.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}`}
        </p>
      </div>
      <AttemptReview
        data={{
          score: review.score,
          correct: review.correct,
          total: review.total,
          topics: review.topics,
          questions: review.questions,
        }}
      />
    </div>
  );
}
