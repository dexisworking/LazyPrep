import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, Sparkles } from "lucide-react";
import { getCurrentProfile } from "@/lib/session";
import { getAiKeyStatus } from "@/lib/ai/keys";
import { CourseWizard } from "@/components/courses/course-wizard";

export const dynamic = "force-dynamic";

// AI course generation can take 10–30s; raise the serverless ceiling (Hobby max).
export const maxDuration = 60;

export default async function NewCoursePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/sign-in");

  const status = await getAiKeyStatus(profile.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/courses"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Courses
      </Link>

      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
          <Sparkles className="h-6 w-6 text-primary" />
          Create a course with AI
        </h1>
        <p className="text-sm text-muted-foreground">
          Answer a few questions and your AI provider builds a tailored course structure.
        </p>
      </div>

      <CourseWizard hasKey={status.configured} />
    </div>
  );
}
