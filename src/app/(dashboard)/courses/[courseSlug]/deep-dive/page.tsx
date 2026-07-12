import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/session";
import { DeepDivePicker } from "@/components/adaptive/deep-dive-picker";

export const dynamic = "force-dynamic";

export default async function DeepDivePage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect("/sign-in");

  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    include: { modules: { include: { checkpoint: true } } },
  });
  if (!course || course.ownerId !== profile.id) notFound();

  const mastered =
    course.adaptive &&
    course.modules.length > 0 &&
    course.modules.every((m) => m.checkpoint?.passed);
  if (!mastered) redirect(`/courses/${courseSlug}`);

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
          <Sparkles className="h-6 w-6 text-primary" />
          Go deeper
        </h1>
        <p className="text-sm text-muted-foreground">
          Pick a concept from <span className="text-foreground">{course.title}</span> to master in
          depth. LazyPrep will build a whole new mastery course dedicated to it.
        </p>
      </div>

      <DeepDivePicker courseId={course.id} />
    </div>
  );
}
