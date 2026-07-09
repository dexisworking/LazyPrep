import type { HeatmapDay } from "@/lib/data/profile";

const WEEKS = 26; // ~6 months, fits mobile

function dateKey(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
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

export function StudyHeatmap({ days }: { days: HeatmapDay[] }) {
  const byDate = new Map(days.map((d) => [dateKey(new Date(d.date)), d]));

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayDow = today.getDay(); // 0=Sun
  // End the grid on this week's Saturday so the last column is the current week.
  const end = new Date(today);
  end.setDate(today.getDate() + (6 - todayDow));
  const totalDays = WEEKS * 7;
  const start = new Date(end);
  start.setDate(end.getDate() - totalDays + 1);

  // Build columns (weeks) × 7 rows (Sun..Sat).
  const columns: {
    date: Date;
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
      date.setDate(start.getDate() + idx);
      const key = dateKey(date);
      const session = byDate.get(key);
      col.push({
        date,
        key,
        lvl: session ? level(session.xpEarned) : 0,
        future: date > today,
        session,
      });
    }
    columns.push(col);
  }

  const monthLabel = (d: Date) => d.toLocaleString("en-US", { month: "short" });

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
        <span>{monthLabel(start)} – {monthLabel(today)}</span>
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
