import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Tones map to the design-system colour set. `streak-*` exists so the flame
 * ramp has a pill treatment without reaching for raw amber/orange/red.
 */
const tones = {
  neutral: { soft: "bg-secondary text-secondary-foreground border-border-subtle", solid: "bg-secondary text-secondary-foreground", outline: "text-foreground border-border" },
  muted: { soft: "bg-muted text-muted-foreground border-border-subtle", solid: "bg-muted text-muted-foreground", outline: "text-muted-foreground border-border" },
  primary: { soft: "bg-primary/10 text-primary border-primary/20", solid: "bg-primary text-primary-foreground", outline: "text-primary border-primary/40" },
  orange: { soft: "bg-np-orange/10 text-np-orange border-np-orange/20", solid: "bg-np-orange text-accent-foreground", outline: "text-np-orange border-np-orange/40" },
  success: { soft: "bg-np-success/10 text-np-success border-np-success/20", solid: "bg-np-success text-background", outline: "text-np-success border-np-success/40" },
  red: { soft: "bg-destructive/10 text-destructive border-destructive/20", solid: "bg-destructive text-destructive-foreground", outline: "text-destructive border-destructive/40" },
  "streak-warm": { soft: "bg-streak-warm/10 text-streak-warm border-streak-warm/20", solid: "bg-streak-warm text-background", outline: "text-streak-warm border-streak-warm/40" },
  "streak-hot": { soft: "bg-streak-hot/10 text-streak-hot border-streak-hot/20", solid: "bg-streak-hot text-background", outline: "text-streak-hot border-streak-hot/40" },
  "streak-fire": { soft: "bg-streak-fire/10 text-streak-fire border-streak-fire/20", solid: "bg-streak-fire text-background", outline: "text-streak-fire border-streak-fire/40" },
} as const;

const sizes = {
  sm: { box: "h-5 gap-1 px-2 text-2xs", icon: "h-3 w-3" },
  md: { box: "h-6 gap-1.5 px-2.5 text-xs", icon: "h-3.5 w-3.5" },
} as const;

export type PillProps = {
  children: ReactNode;
  tone?: keyof typeof tones;
  variant?: "soft" | "solid" | "outline";
  size?: keyof typeof sizes;
  icon?: LucideIcon;
  uppercase?: boolean;
  className?: string;
};

/**
 * The one metadata chip — topic tags, difficulty, status, counts.
 *
 * Replaces ~53 hand-rolled `rounded-full … text-[10px]` spans. Kept separate
 * from `ui/badge.tsx` because badges are interactive/polymorphic (they support
 * `render` and anchor states) while these are inert labels, and because the
 * tone axis here is app vocabulary rather than shadcn vocabulary.
 */
export function Pill({
  children,
  tone = "neutral",
  variant = "soft",
  size = "md",
  icon: Icon,
  uppercase = false,
  className,
}: PillProps) {
  const s = sizes[size];
  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 items-center justify-center rounded-full border border-transparent font-medium whitespace-nowrap",
        s.box,
        tones[tone][variant],
        uppercase && "font-semibold tracking-wider uppercase",
        className,
      )}
    >
      {Icon && <Icon className={cn(s.icon, "shrink-0")} aria-hidden />}
      {children}
    </span>
  );
}
