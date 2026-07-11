"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/session";
import { canAccessCourse } from "@/lib/data/courses";

/**
 * Set (or clear) the target exam date for a course, for the current user.
 * Idempotent upsert keyed on (profile, course). Pass null to clear.
 */
export async function setExamDate(courseId: string, isoDate: string | null) {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false as const, error: "Not authenticated." };

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || !canAccessCourse(course, profile.id)) {
    return { ok: false as const, error: "Course not found." };
  }

  // Parse a yyyy-mm-dd string (from a native date input) as a plain date.
  let examDate: Date | null = null;
  if (isoDate) {
    const d = new Date(isoDate + "T00:00:00Z");
    if (Number.isNaN(d.getTime())) return { ok: false as const, error: "Invalid date." };
    examDate = d;
  }

  await prisma.studyPlan.upsert({
    where: { profileId_courseId: { profileId: profile.id, courseId: course.id } },
    update: { examDate },
    create: { profileId: profile.id, courseId: course.id, examDate },
  });

  revalidatePath(`/courses/${course.slug}`);
  revalidatePath("/dashboard");
  return { ok: true as const };
}
