"use server";

import { prisma } from "@/lib/prisma";
import { getSession, getCurrentProfile } from "@/lib/session";
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

/** Mark the first-run onboarding tour as seen (completed or skipped). */
export async function completeOnboarding() {
  const profile = await getCurrentProfile();
  if (!profile || profile.onboardedAt) return;

  await prisma.profile.update({
    where: { id: profile.id },
    data: { onboardedAt: new Date() },
  });
}

/**
 * Permanently delete the signed-in user's account and ALL associated data.
 * Requires the user to re-type their exact email as confirmation. Deleting the
 * Better Auth `user` row cascades to sessions, accounts, the Profile, and every
 * profile-owned record (progress, attempts, flashcard reviews, study sessions,
 * AI key, and any AI-generated courses they own). Irreversible.
 */
export async function deleteAccount(
  emailConfirmation: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session?.user) return { ok: false, error: "Not authenticated." };

  const typed = emailConfirmation.trim().toLowerCase();
  if (!typed || typed !== session.user.email.toLowerCase()) {
    return { ok: false, error: "The email you typed doesn't match your account." };
  }

  // Deleting the user row cascades to sessions, accounts, profile and all
  // profile-owned data. The client clears the auth cookie via signOut() after.
  await prisma.user.delete({ where: { id: session.user.id } });
  return { ok: true };
}
