import type { HeatmapDay } from "@/lib/data/profile";
import { dayKey, DEFAULT_TZ } from "@/lib/day";

const WEEKS = 26; // ~6 months, fits mobile
const DAY_MS = 86_400_000;

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

function level(xp: number): 0 | 1 | 2 | 3 | 4 {
  if (xp <= 0) return 0;
  if (xp <= 10) return 1;
  if (xp <= 25) return 2;
  if (xp <= 50) return 3;
  return 4;
}

const LEVEL_CLASS: Record<number, string> = {
  0: "bg-secondary",
  1: "bg-primary/25",
  2: "bg-primary/45",
  3: "bg-primary/70",
  4: "bg-primary",
};

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

  // Build columns (weeks) × 7 rows (Sun..Sat).
  const columns: {
    key: string;
    lvl: number;
    future: boolean;
    session?: HeatmapDay;
  }[][] = [];
  for (let c = 0; c < WEEKS; c++) {
    const col: (typeof columns)[number] = [];
    for (let r = 0; r < 7; r++) {
      const idx = c * 7 + r;
      const date = new Date(start);
      date.setUTCDate(start.getUTCDate() + idx);
      const key = utcToKey(date);
      const session = byDate.get(key);
      col.push({
        key,
        lvl: session ? level(session.xpEarned) : 0,
        future: key > todayKey,
        session,
      });
    }
    columns.push(col);
  }

  const monthLabel = (key: string) =>
    keyToUtc(key).toLocaleString("en-US", { month: "short", timeZone: "UTC" });

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto pb-1">
        <div className="flex gap-1">
          {columns.map((col, ci) => (
            <div key={ci} className="flex flex-col gap-1">
              {col.map((cell) =>
                cell.future ? (
                  <div key={cell.key} className="h-3 w-3 rounded-sm opacity-0" />
                ) : (
                  <div
                    key={cell.key}
                    className={`h-3 w-3 rounded-sm ${LEVEL_CLASS[cell.lvl]} ring-1 ring-inset ring-border/30`}
                    title={
                      cell.session
                        ? `${cell.key} · ${cell.session.xpEarned} XP · ${cell.session.questionsAnswered} questions · ${cell.session.lessonsCompleted} lessons`
                        : `${cell.key} · no activity`
                    }
                  />
                ),
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{monthLabel(utcToKey(start))} – {monthLabel(todayKey)}</span>
        <div className="flex items-center gap-1">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((l) => (
            <div key={l} className={`h-3 w-3 rounded-sm ${LEVEL_CLASS[l]} ring-1 ring-inset ring-border/30`} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
