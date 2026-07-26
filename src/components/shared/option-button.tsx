import { CheckCircle2, XCircle } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * `idle`      — answerable, not chosen
 * `selected`  — chosen, not yet graded
 * `correct`   — graded, this is the right answer
 * `incorrect` — graded, the learner picked this and it was wrong
 * `dimmed`    — graded, this option is neither picked nor correct
 */
export type OptionState = "idle" | "selected" | "correct" | "incorrect" | "dimmed";

const sizes = {
  sm: { box: "gap-2.5 px-3 py-2.5 text-sm", marker: "h-5 w-5 text-2xs", glyph: "h-3.5 w-3.5" },
  md: { box: "gap-3 px-4 py-3 text-sm", marker: "h-6 w-6 text-xs", glyph: "h-4 w-4" },
} as const;

const boxStates: Record<OptionState, string> = {
  idle: "border-border bg-background hover:border-primary/40 hover:bg-secondary/50",
  selected: "border-primary bg-primary/10",
  correct: "border-np-success bg-np-success/10 text-foreground",
  incorrect: "border-destructive bg-destructive/10 text-foreground",
  dimmed: "border-border-subtle opacity-60",
};

const markerStates: Record<OptionState, string> = {
  idle: "border-border text-muted-foreground",
  selected: "border-primary text-primary",
  correct: "border-np-success text-np-success",
  incorrect: "border-destructive text-destructive",
  dimmed: "border-border text-muted-foreground",
};

export type OptionButtonProps = {
  /** Zero-based; rendered as A/B/C/D. */
  index: number;
  label: ReactNode;
  state: OptionState;
  onSelect?: () => void;
  disabled?: boolean;
  /** `div` for read-only review surfaces such as the wrong-answer notebook. */
  as?: "button" | "div";
  size?: keyof typeof sizes;
  className?: string;
};

/**
 * The one multiple-choice option.
 *
 * Replaces five copies across practice, mock tests, checkpoints, lesson quiz
 * blocks and the notebook. Adds what all five were missing: a `focus-visible`
 * ring and `aria-pressed`.
 *
 * Presentation only — which option is selected, when grading happens and what
 * counts as correct all stay with the caller.
 */
export function OptionButton({
  index,
  label,
  state,
  onSelect,
  disabled,
  as = "button",
  size = "md",
  className,
}: OptionButtonProps) {
  const s = sizes[size];
  const graded = state === "correct" || state === "incorrect" || state === "dimmed";

  const inner = (
    <>
      <span
        className={cn(
          "flex flex-shrink-0 items-center justify-center rounded-full border font-semibold",
          s.marker,
          markerStates[state],
        )}
      >
        {state === "correct" ? (
          <CheckCircle2 className={s.glyph} aria-hidden />
        ) : state === "incorrect" ? (
          <XCircle className={s.glyph} aria-hidden />
        ) : (
          String.fromCharCode(65 + index)
        )}
      </span>
      <span className="flex-1">{label}</span>
    </>
  );

  const classes = cn(
    "flex w-full items-center rounded-control border text-left transition-[background-color,border-color,opacity] duration-(--dur-fast) ease-standard",
    s.box,
    boxStates[state],
    as === "button" &&
      !disabled &&
      "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
    className,
  );

  if (as === "div") {
    return <div className={classes}>{inner}</div>;
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      aria-pressed={graded ? undefined : state === "selected"}
      className={classes}
    >
      {inner}
    </button>
  );
}
