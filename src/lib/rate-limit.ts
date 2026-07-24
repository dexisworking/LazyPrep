import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Thrown when a rate limit is exceeded. Server actions surface `message` to the
 * user; catch this specifically to render a "slow down" state.
 */
export class RateLimitError extends Error {
  retryAfterSec: number;
  constructor(message: string, retryAfterSec: number) {
    super(message);
    this.name = "RateLimitError";
    this.retryAfterSec = retryAfterSec;
  }
}

/**
 * Best-effort per-key fixed-window limiter backed by Postgres (`ActionRateLimit`).
 *
 * Intended for authenticated server actions (AI generation) where cost/abuse is
 * per-user rather than adversarial high-concurrency — a small over-count under a
 * race is acceptable, so we use a read-then-write rather than a locking upsert.
 * Throws {@link RateLimitError} when `key` exceeds `max` within `windowSec`.
 */
export async function checkRateLimit(
  key: string,
  max: number,
  windowSec: number,
): Promise<void> {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + windowSec * 1000);

  // Perform atomic upsert / check in a single Prisma transaction with lock/atomic update
  const record = await prisma.$transaction(async (tx) => {
    const existing = await tx.actionRateLimit.findUnique({ where: { key } });

    if (!existing || existing.windowEnd <= now) {
      return tx.actionRateLimit.upsert({
        where: { key },
        create: { key, count: 1, windowEnd },
        update: { count: 1, windowEnd },
      });
    }

    if (existing.count >= max) {
      return existing;
    }

    return tx.actionRateLimit.update({
      where: { key },
      data: { count: { increment: 1 } },
    });
  });

  if (record.count >= max && record.windowEnd > now) {
    const retryAfterSec = Math.max(1, Math.ceil((record.windowEnd.getTime() - now.getTime()) / 1000));
    throw new RateLimitError(
      `You're generating too fast. Please wait ${retryAfterSec}s and try again.`,
      retryAfterSec,
    );
  }
}

/**
 * Per-bucket caps for AI-generation server actions (per user, per 10 min):
 *  - `course`  = full adaptive-course / deep-dive creation (heavy: many rows + AI calls)
 *  - `content` = on-demand lesson/phase/flashcard/mock/checkpoint/suggestion generation
 * `content` is looser because a legitimate reader triggers it just by opening lessons.
 */
export const AI_LIMITS = {
  course: { max: 6, windowSec: 600 },
  content: { max: 40, windowSec: 600 },
  tutor: { max: 40, windowSec: 300 },
} as const;

/**
 * Rate-limit a profile's AI generation for the given bucket. Returns a
 * user-facing error string when over the cap, or `null` when allowed — so
 * callers can fold it into their `{ ok: false, error }` return shape without
 * a try/catch.
 */
export async function guardAiRateLimit(
  profileId: string,
  bucket: keyof typeof AI_LIMITS,
): Promise<string | null> {
  const { max, windowSec } = AI_LIMITS[bucket];
  try {
    await checkRateLimit(`${profileId}:${bucket}`, max, windowSec);
    return null;
  } catch (e) {
    if (e instanceof RateLimitError) return e.message;
    throw e;
  }
}
