"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/session";

/**
 * Enroll the current user in a course (idempotent). Returns the course slug so
 * the caller can navigate to it.
 */
export async function enrollInCourse(courseId: string) {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("Not authenticated");

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { slug: true },
  });
  if (!course) throw new Error("Course not found");

  await prisma.enrollment.upsert({
    where: { profileId_courseId: { profileId: profile.id, courseId } },
    update: {},
    create: { profileId: profile.id, courseId },
  });

  revalidatePath("/courses");
  revalidatePath(`/courses/${course.slug}`);
  revalidatePath("/dashboard");

  return course.slug;
}
