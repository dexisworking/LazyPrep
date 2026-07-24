"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/session";
import { dayDate, DEFAULT_TZ } from "@/lib/day";

/**
 * Log accumulated active study time (minutes) for today.
 */
export async function logStudyTime(minutes: number) {
  if (typeof minutes !== "number" || minutes <= 0 || minutes > 120) return;

  const profile = await getCurrentProfile();
  if (!profile) return;

  const tz = profile.timezone || DEFAULT_TZ;
  const today = dayDate(new Date(), tz);

  await prisma.studySession.upsert({
    where: { profileId_date: { profileId: profile.id, date: today } },
    update: {
      studyMinutes: { increment: Math.round(minutes) },
    },
    create: {
      profileId: profile.id,
      date: today,
      studyMinutes: Math.round(minutes),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/profile");
}
