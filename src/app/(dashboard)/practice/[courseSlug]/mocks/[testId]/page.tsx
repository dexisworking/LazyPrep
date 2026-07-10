import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getCurrentProfile } from "@/lib/session";
import { getMockTestForTaking } from "@/lib/data/mock-tests";
import { MockTestRunner } from "@/components/mock-tests/mock-test-runner";

export const dynamic = "force-dynamic";

export default async function TakeMockTestPage({
  params,
}: {
  params: Promise<{ courseSlug: string; testId: string }>;
}) {
  const { courseSlug, testId } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect("/sign-in");

  const test = await getMockTestForTaking(testId, profile.id);
  if (!test || test.courseSlug !== courseSlug || test.questions.length === 0) notFound();

  const backHref = `/practice/${test.courseSlug}/mocks`;

  return (
    <div className="space-y-6">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Mock Tests
      </Link>
      <MockTestRunner
        testId={test.id}
        title={`${test.title} — ${test.courseTitle}`}
        durationMinutes={test.durationMinutes}
        questions={test.questions}
        backHref={backHref}
      />
    </div>
  );
}
