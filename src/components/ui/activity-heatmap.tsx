/**
 * GitHub-style contribution grid, in LazyPrep blue.
 *
 * Presentation only — the caller does the calendar maths and hands over a flat,
 * chronological list of days that starts on a Sunday. That keeps the timezone
 * logic in one place (`components/profile/heatmap.tsx`) and lets the landing
 * page render the same grid from a canned sample.
 *
 * The five-step ramp is built with `color-mix` against `--primary` rather than
 * five opacity utilities, so levels 1–3 stay opaque: `bg-primary/25` over a
 * card and over the page produced two visibly different greys for "same amount
 * of study", which is exactly what a heatmap must not do.
 */

import { cn } from "@/lib/utils";

export type HeatLevel = 0 | 1 | 2 | 3 | 4;

export type HeatmapDayCell = {
  /** ISO day key, "YYYY-MM-DD". */
  key: string;
  level: HeatLevel;
  /** Days after today — rendered as an invisible spacer to keep the grid square. */
  future?: boolean;
  /** Hover text. */
  title?: string;
};

/** Opaque blue ramp. Index = level. */
export const HEAT_FILL: Record<HeatLevel, string> = {
  0: "color-mix(in oklch, var(--foreground) 7%, var(--card))",
  1: "color-mix(in oklch, var(--primary) 26%, var(--card))",
  2: "color-mix(in oklch, var(--primary) 50%, var(--card))",
  3: "color-mix(in oklch, var(--primary) 75%, var(--card))",
  4: "var(--primary)",
};

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Weekday rows we label. GitHub labels Mon/Wed/Fri; rows are Sun-indexed. */
const DAY_LABELS: Record<number, string> = { 1: "Mon", 3: "Wed", 5: "Fri" };

export function HeatCell({
  level,
  size,
  className,
  ...rest
}: {
  level: HeatLevel;
  size: number;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-[3px] ring-1 ring-inset ring-foreground/[0.06]", className)}
      style={{ width: size, height: size, background: HEAT_FILL[level] }}
      {...rest}
    />
  );
}

export function ActivityHeatmap({
  days,
  cellSize = 11,
  gap = 3,
  showLabels = true,
  legend = true,
  footerLeft,
  className,
}: {
  /** Chronological, length divisible by 7, first entry a Sunday. */
  days: HeatmapDayCell[];
  cellSize?: number;
  gap?: number;
  showLabels?: boolean;
  legend?: boolean;
  /** Optional summary text shown at the bottom-left, opposite the legend. */
  footerLeft?: React.ReactNode;
  className?: string;
}) {
  const weeks: HeatmapDayCell[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  // Label a column when its month differs from the previous column's, so each
  // month gets exactly one marker aligned to the week it starts in.
  const monthLabels = weeks.map((week, i) => {
    const month = Number(week[0].key.slice(5, 7)) - 1;
    if (i === 0) return null; // first column is usually a partial month
    const prev = Number(weeks[i - 1][0].key.slice(5, 7)) - 1;
    return month !== prev ? MONTHS[month] : null;
  });

  return (
    <div className={cn("space-y-2", className)}>
      <div className="overflow-x-auto pb-1">
        <div className="inline-flex flex-col" style={{ gap }}>
          {/* Month row */}
          {showLabels && (
            <div className="flex" style={{ gap, marginLeft: 28 }}>
              {monthLabels.map((label, i) => (
                <div
                  key={i}
                  className="relative text-3xs text-muted-foreground"
                  style={{ width: cellSize, height: 12 }}
                >
                  {label && (
                    <span className="absolute left-0 top-0 whitespace-nowrap">{label}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex" style={{ gap }}>
            {/* Weekday column */}
            {showLabels && (
              <div className="flex flex-col" style={{ gap, width: 28 - gap }}>
                {Array.from({ length: 7 }, (_, r) => (
                  <div
                    key={r}
                    className="flex items-center text-3xs leading-none text-muted-foreground"
                    style={{ height: cellSize }}
                  >
                    {DAY_LABELS[r] ?? ""}
                  </div>
                ))}
              </div>
            )}

            {/* Week columns */}
            {weeks.map((week, ci) => (
              <div key={ci} className="flex flex-col" style={{ gap }}>
                {week.map((cell) =>
                  cell.future ? (
                    <div
                      key={cell.key}
                      style={{ width: cellSize, height: cellSize }}
                      aria-hidden
                    />
                  ) : (
                    <HeatCell
                      key={cell.key}
                      level={cell.level}
                      size={cellSize}
                      title={cell.title}
                    />
                  ),
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {(legend || footerLeft) && (
        <div className="flex items-center justify-between gap-3 text-2xs text-muted-foreground">
          <span className="truncate">{footerLeft}</span>
          {legend && (
            <div className="flex shrink-0 items-center" style={{ gap }}>
              <span className="mr-0.5">Less</span>
              {([0, 1, 2, 3, 4] as HeatLevel[]).map((l) => (
                <HeatCell key={l} level={l} size={cellSize} />
              ))}
              <span className="ml-0.5">More</span>
            </div>
          )}
        </div>
      )}

      <span className="sr-only">
        Study activity grid. Each square is one day; darker blue means more XP earned.
      </span>
    </div>
  );
}
