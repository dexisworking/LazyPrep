import type { HeatmapDay } from "@/lib/data/profile";
import { dayKey, DEFAULT_TZ } from "@/lib/day";
import { ActivityHeatmap, type HeatLevel, type HeatmapDayCell } from "@/components/ui/activity-heatmap";

const WEEKS = 26; // ~6 months, fits mobile

/** ISO day key ("YYYY-MM-DD") for a stored session date (UTC-midnight of a local day). */
function sessionKey(date: Date): string {
  return new Date(date).toISOString().slice(0, 10);
}

/** A UTC-midnight Date for an ISO day key — used only for calendar arithmetic. */
function keyToUtc(key: string): Date {
  return new Date(`${key}T00:00:00.000Z`);
}

function utcToKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function level(xp: number): HeatLevel {
  if (xp <= 0) return 0;
  if (xp <= 10) return 1;
  if (xp <= 25) return 2;
  if (xp <= 50) return 3;
  return 4;
}

const LONG_DATE = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function StudyHeatmap({ days, tz = DEFAULT_TZ }: { days: HeatmapDay[]; tz?: string }) {
  const byDate = new Map(days.map((d) => [sessionKey(d.date), d]));

  // "Today" is the user's local calendar day; all grid math is done in UTC-day
  // space anchored to that key so it's independent of the server's timezone.
  const todayKey = dayKey(new Date(), tz);
  const todayUtc = keyToUtc(todayKey);
  const todayDow = todayUtc.getUTCDay(); // 0=Sun

  // End the grid on this week's Saturday so the last column is the current week.
  const end = new Date(todayUtc);
  end.setUTCDate(end.getUTCDate() + (6 - todayDow));
  const totalDays = WEEKS * 7;
  const start = new Date(end);
  start.setUTCDate(end.getUTCDate() - totalDays + 1);

  const cells: HeatmapDayCell[] = [];
  let activeDays = 0;
  let totalXp = 0;

  for (let i = 0; i < totalDays; i++) {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + i);
    const key = utcToKey(date);
    const session = byDate.get(key);
    const future = key > todayKey;

    if (session && !future) {
      if (session.xpEarned > 0) activeDays++;
      totalXp += session.xpEarned;
    }

    cells.push({
      key,
      level: session ? level(session.xpEarned) : 0,
      future,
      title: session
        ? `${LONG_DATE.format(date)} · ${session.xpEarned} XP · ${session.questionsAnswered} questions · ${session.lessonsCompleted} lessons`
        : `${LONG_DATE.format(date)} · no activity`,
    });
  }

  return (
    <ActivityHeatmap
      days={cells}
      footerLeft={
        <>
          <span className="font-semibold text-foreground tabular-nums">{activeDays}</span> active
          day{activeDays === 1 ? "" : "s"} ·{" "}
          <span className="font-semibold text-foreground tabular-nums">{totalXp}</span> XP in the
          last 6 months
        </>
      }
    />
  );
}
