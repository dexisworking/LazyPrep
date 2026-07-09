import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Server-side session helpers.
 *
 * `getSession` and `getCurrentProfile` are wrapped in React `cache` so that
 * multiple calls within a single request (layout + page + actions) hit the
 * database only once.
 */

export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

/**
 * Returns the gamification Profile for the signed-in user, creating one if it
 * is somehow missing (e.g. a user created before the signup hook existed).
 * Returns null when there is no session.
 */
export const getCurrentProfile = cache(async () => {
  const session = await getSession();
  if (!session?.user) return null;

  const userId = session.user.id;
  const existing = await prisma.profile.findUnique({ where: { userId } });
  if (existing) return existing;

  return prisma.profile.create({
    data: { userId, displayName: session.user.name },
  });
});
