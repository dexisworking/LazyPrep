import { getCurrentProfile } from "@/lib/session";
import { getCoursesOverview } from "@/lib/data/courses";
import { CourseFilterContainer } from "@/components/courses/course-filter";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const profile = await getCurrentProfile();
  const courses = await getCoursesOverview(profile?.id ?? null);

  const mine = profile ? courses.filter((c) => c.ownerId === profile.id) : [];
  const curated = courses.filter((c) => c.ownerId === null);

  return (
    <CourseFilterContainer mine={mine} curated={curated} />
  );
}
