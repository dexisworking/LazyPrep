/**
 * Timezone-aware "calendar day" helpers.
 *
 * Every day-boundary decision in the app (streaks, today's activity counters,
 * the study heatmap) must agree on what "today" is for a given user. Doing this
 * with `new Date(y, m, d)` uses the *server's* local time — which is UTC on
 * Vercel — so a user in IST (UTC+5:30) studying at 02:00 would be counted on the
 * previous day. These helpers compute the wall-clock day in the user's own IANA
 * timezone instead.
 */

export const DEFAULT_TZ = "UTC";

/**
 * The wall-clock calendar day (`"YYYY-MM-DD"`) for an instant, as seen in `tz`.
 * `en-CA` formats as ISO `YYYY-MM-DD`, which sorts and parses cleanly.
 */
export function dayKey(instant: Date, tz: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
}

/**
 * The value to store in a `@db.Date` column for the local day of `instant`:
 * UTC-midnight of the user's wall-clock date. Stored this way, the row's
 * calendar day always equals the user's local day regardless of server tz, and
 * it reads back as the same key via `date.toISOString().slice(0, 10)`.
 */
export function dayDate(instant: Date, tz: string): Date {
  return new Date(`${dayKey(instant, tz)}T00:00:00.000Z`);
}

/** Whole-day difference `bKey - aKey` between two `"YYYY-MM-DD"` day keys. */
export function daysBetweenKeys(aKey: string, bKey: string): number {
  const a = Date.parse(`${aKey}T00:00:00.000Z`);
  const b = Date.parse(`${bKey}T00:00:00.000Z`);
  return Math.round((b - a) / 86_400_000);
}

/** True if `tz` is a valid IANA timezone the runtime understands. */
export function isValidTz(tz: string): boolean {
  if (!tz) return false;
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}
