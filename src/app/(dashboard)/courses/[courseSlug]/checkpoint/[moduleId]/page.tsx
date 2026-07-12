import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, Target } from "lucide-react";
import { getCurrentProfile } from "@/lib/session";
import { getCheckpointQuiz } from "@/lib/data/adaptive";
import { CheckpointGenerator } from "@/components/adaptive/checkpoint-generator";
import { CheckpointMocktest } from "@/components/adaptive/checkpoint-mocktest";

export const dynamic = "force-dynamic";

// Hosts checkpoint-question generation (AI); raise the serverless ceiling.
export const maxDuration = 60;

export default async function CheckpointPage({
  params,
}: {
  params: Promise<{ courseSlug: string; moduleId: string }>;
}) {
  const { courseSlug, moduleId } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect("/sign-in");

  const quiz = await getCheckpointQuiz(moduleId, profile.id);
  if (!quiz || quiz.courseSlug !== courseSlug) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href={`/courses/${courseSlug}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to course
      </Link>

      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
          <Target className="h-6 w-6 text-np-red" />
          {quiz.phaseTitle} Checkpoint
        </h1>
        <p className="text-sm text-muted-foreground">
          Prove your mastery of this phase to unlock the next.
        </p>
      </div>

      {quiz.generated ? (
        <CheckpointMocktest
          moduleId={quiz.moduleId}
          courseSlug={courseSlug}
          phaseTitle={quiz.phaseTitle}
          threshold={quiz.threshold}
          questions={quiz.questions}
        />
      ) : (
        <CheckpointGenerator moduleId={quiz.moduleId} />
      )}
    </div>
  );
}
