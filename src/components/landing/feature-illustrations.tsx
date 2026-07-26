/**
 * Inline SVG/DOM illustrations for the landing-page feature bento.
 *
 * All hand-drawn with tokens — no chart library and no raster assets, so they
 * theme correctly, cost nothing to load, and stay crisp at any density. Each is
 * decorative: the surrounding card carries the real heading and copy, so these
 * are `aria-hidden` and never the only place a fact appears.
 */

import { Sparkles } from "lucide-react";

import { ActivityHeatmap, type HeatLevel, type HeatmapDayCell } from "@/components/ui/activity-heatmap";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
   AI course generation — a prompt turning into a module list
   ───────────────────────────────────────────────────────────── */

const GENERATED_MODULES = ["Kinetics & rate laws", "Reaction mechanisms", "Spectroscopy"];

export function GenerationIllustration({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("space-y-2.5", className)}>
      <div className="flex items-center gap-2 rounded-control border border-primary/25 bg-primary/5 px-3 py-2.5">
        <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" />
        <span className="truncate text-xs text-foreground">Organic Chemistry — exam prep</span>
        <span className="ml-auto h-3.5 w-px bg-primary motion-safe:animate-pulse" />
      </div>

      {GENERATED_MODULES.map((m, i) => (
        <div
          key={m}
          className="flex items-center gap-2.5 rounded-control border border-border-subtle bg-background/50 px-3 py-2"
          style={{ opacity: 1 - i * 0.18 }}
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary/10 text-3xs font-bold text-primary tabular-nums">
            {i + 1}
          </span>
          <span className="truncate text-2xs text-muted-foreground">{m}</span>
          <span className="ml-auto shrink-0 rounded-full bg-secondary px-1.5 py-0.5 text-3xs text-muted-foreground">
            {4 + i} lessons
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Spaced repetition — the forgetting curve, with and without reviews
   ───────────────────────────────────────────────────────────── */

/** Review points on the saw-tooth, in viewBox coords. */
const REVIEWS = [
  [62, 58],
  [132, 53],
  [216, 45],
];

export function ForgettingCurveIllustration({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 300 130"
      className={cn("w-full", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Baseline grid */}
      {[26, 52, 78, 104].map((y) => (
        <line
          key={y}
          x1="8"
          x2="292"
          y1={y}
          y2={y}
          stroke="var(--border-subtle)"
          strokeWidth="1"
        />
      ))}

      {/* Decay with no review — the thing spaced repetition prevents */}
      <path
        d="M10 18 C 70 74 130 98 292 108"
        stroke="var(--muted-foreground)"
        strokeWidth="2"
        strokeDasharray="4 4"
        opacity="0.55"
        strokeLinecap="round"
      />

      {/* Retention with reviews — each review resets it, and decays slower */}
      <path
        d="M10 18 C 32 45 48 55 62 58 L62 16 C 92 42 112 50 132 53 L132 14 C 164 36 190 42 216 45 L216 12 C 246 26 268 30 292 32"
        stroke="var(--primary)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {REVIEWS.map(([x, y]) => (
        <g key={x}>
          <circle cx={x} cy={y} r="4" fill="var(--card)" stroke="var(--primary)" strokeWidth="2" />
          <line
            x1={x}
            x2={x}
            y1="8"
            y2={y}
            stroke="var(--primary)"
            strokeWidth="1"
            strokeDasharray="2 3"
            opacity="0.4"
          />
        </g>
      ))}

      <text x="10" y="126" fill="var(--muted-foreground)" fontSize="8">
        review 1
      </text>
      <text x="246" y="126" fill="var(--muted-foreground)" fontSize="8">
        30 days
      </text>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   Progress — a sample study heatmap
   ───────────────────────────────────────────────────────────── */

/**
 * Deterministic pseudo-random so server and client agree. A real `Math.random()`
 * here would hydrate-mismatch every square on the page.
 */
function seeded(n: number): number {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const SAMPLE_WEEKS = 18;
/** A Sunday, so the grid's first column starts on the right weekday row. */
const SAMPLE_START = Date.UTC(2026, 0, 4);

function sampleDays(): HeatmapDayCell[] {
  const out: HeatmapDayCell[] = [];
  for (let i = 0; i < SAMPLE_WEEKS * 7; i++) {
    const d = new Date(SAMPLE_START + i * 86_400_000);
    const dow = d.getUTCDay();
    const r = seeded(i + 1);
    // Weekends lighter, and the streak ramps up over the period.
    const ramp = i / (SAMPLE_WEEKS * 7);
    const weight = r * (dow === 0 || dow === 6 ? 0.55 : 1) * (0.45 + ramp);
    let level: HeatLevel = 0;
    if (weight > 0.55) level = 4;
    else if (weight > 0.4) level = 3;
    else if (weight > 0.26) level = 2;
    else if (weight > 0.12) level = 1;
    out.push({ key: d.toISOString().slice(0, 10), level });
  }
  return out;
}

export function HeatmapIllustration({ className }: { className?: string }) {
  return (
    <div aria-hidden className={className}>
      <ActivityHeatmap days={sampleDays()} cellSize={10} gap={3} legend showLabels />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MCQ practice — accuracy ring
   ───────────────────────────────────────────────────────────── */

export function AccuracyIllustration({
  value = 78,
  className,
}: {
  value?: number;
  className?: string;
}) {
  const r = 34;
  const circumference = 2 * Math.PI * r;

  return (
    <div aria-hidden className={cn("flex items-center gap-4", className)}>
      <svg viewBox="0 0 88 88" className="h-[88px] w-[88px] shrink-0">
        <circle cx="44" cy="44" r={r} stroke="var(--secondary)" strokeWidth="9" fill="none" />
        <circle
          cx="44"
          cy="44"
          r={r}
          stroke="var(--np-red)"
          strokeWidth="9"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${(value / 100) * circumference} ${circumference}`}
          transform="rotate(-90 44 44)"
        />
        <text
          x="44"
          y="48"
          textAnchor="middle"
          fill="var(--foreground)"
          fontSize="19"
          fontWeight="800"
        >
          {value}%
        </text>
      </svg>
      <dl className="space-y-1.5 text-2xs">
        <div>
          <dt className="text-muted-foreground">Answered</dt>
          <dd className="font-bold tabular-nums text-foreground">1,284</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">In your notebook</dt>
          <dd className="font-bold tabular-nums text-np-red">42</dd>
        </div>
      </dl>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Streaks — daily XP bars
   ───────────────────────────────────────────────────────────── */

const XP_BARS = [28, 41, 16, 52, 44, 12, 35, 58, 47, 66, 39, 71, 62, 84];

export function StreakChartIllustration({ className }: { className?: string }) {
  const max = Math.max(...XP_BARS);

  return (
    <div aria-hidden className={cn("space-y-2", className)}>
      <div className="flex h-24 items-end gap-1.5">
        {XP_BARS.map((v, i) => {
          const isRecent = i >= XP_BARS.length - 4;
          return (
            <div
              key={i}
              className={cn(
                "flex-1 rounded-t-[3px]",
                isRecent ? "bg-streak-hot" : "bg-primary/45",
              )}
              style={{ height: `${(v / max) * 100}%` }}
            />
          );
        })}
      </div>
      <div className="flex items-center justify-between text-3xs text-muted-foreground">
        <span>14 days ago</span>
        <span className="font-semibold text-streak-hot">today · 84 XP</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Rich lessons — a miniature lesson body
   ───────────────────────────────────────────────────────────── */

export function LessonIllustration({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("space-y-2", className)}>
      <div className="h-2 w-2/5 rounded-full bg-foreground/25" />
      <div className="h-1.5 w-full rounded-full bg-foreground/10" />
      <div className="h-1.5 w-4/5 rounded-full bg-foreground/10" />

      {/* Code block */}
      <div className="mt-2 space-y-1 rounded-control border border-terminal-border bg-terminal-bg p-2">
        <div className="flex gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-terminal-dot-red" />
          <span className="h-1.5 w-1.5 rounded-full bg-terminal-dot-amber" />
          <span className="h-1.5 w-1.5 rounded-full bg-terminal-dot-green" />
        </div>
        <div className="h-1.5 w-3/5 rounded-full bg-terminal-prompt/70" />
        <div className="h-1.5 w-4/5 rounded-full bg-terminal-fg-dim" />
      </div>

      {/* Table */}
      <div className="grid grid-cols-3 gap-px overflow-hidden rounded-control border border-border-subtle bg-border-subtle">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className={cn("h-4", i < 3 ? "bg-secondary" : "bg-card")} />
        ))}
      </div>
    </div>
  );
}
