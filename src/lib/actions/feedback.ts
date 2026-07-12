"use server";

import { after } from "next/server";
import { headers } from "next/headers";
import * as Sentry from "@sentry/nextjs";
import { prisma } from "@/lib/prisma";
import { getSession, getCurrentProfile } from "@/lib/session";
import { checkRateLimit, RateLimitError } from "@/lib/rate-limit";
import { feedbackSchema } from "@/lib/validation";
import { sendFeedbackNotification } from "@/lib/email";

/** Store a piece of in-app feedback (bug/idea/other) from the signed-in user. */
export async function submitFeedback(input: { type: string; message: string; url?: string }) {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false as const, error: "Please sign in to send feedback." };

  const parsed = feedbackSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Please write a little more before sending." };
  }

  // Cap submissions so the widget can't be used to spam the table.
  try {
    await checkRateLimit(`${profile.id}:feedback`, 10, 600); // 10 per 10 min
  } catch (e) {
    if (e instanceof RateLimitError) return { ok: false as const, error: e.message };
    throw e;
  }

  const userAgent = (await headers()).get("user-agent")?.slice(0, 400) ?? null;

  await prisma.feedback.create({
    data: {
      profileId: profile.id,
      type: parsed.data.type,
      message: parsed.data.message,
      url: parsed.data.url?.slice(0, 500) ?? null,
      userAgent,
    },
  });

  // Notify the operator by email — after the response so it never blocks or
  // fails the user's submission. Submitter details are captured now (request
  // context) and passed into the deferred callback.
  const session = await getSession();
  const fromEmail = session?.user?.email ?? null;
  const fromName = profile.displayName ?? session?.user?.name ?? null;
  after(async () => {
    try {
      await sendFeedbackNotification({
        type: parsed.data.type,
        message: parsed.data.message,
        url: parsed.data.url ?? null,
        fromEmail,
        fromName,
      });
    } catch (e) {
      console.error("[feedback] notification email failed:", e);
      Sentry.captureException(e);
    }
  });

  return { ok: true as const };
}
