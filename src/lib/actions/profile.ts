"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/session";
import { isValidTz } from "@/lib/day";

/**
 * Persist the signed-in user's IANA timezone (detected client-side). Day
 * boundaries for streaks/heatmap are computed in this zone. No-ops when the
 * value is unchanged or invalid.
 */
export async function updateTimezone(tz: string) {
  const profile = await getCurrentProfile();
  if (!profile) return;
  if (!isValidTz(tz) || tz === profile.timezone) return;

  await prisma.profile.update({
    where: { id: profile.id },
    data: { timezone: tz },
  });
}
