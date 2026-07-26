import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Each tone is a face colour plus the darker "underside" that shows as the
 * bottom edge. Pressing collapses the edge and drops the face onto it.
 */
const tones = {
  primary: "bg-primary text-primary-foreground shadow-[0_4px_0_0_color-mix(in_oklch,var(--primary),black_28%)]",
  xp: "bg-game-xp text-game-on-solid shadow-[0_4px_0_0_var(--game-xp-deep)]",
  flame: "bg-game-flame text-game-on-solid shadow-[0_4px_0_0_var(--game-flame-deep)]",
  gem: "bg-game-gem text-game-on-solid shadow-[0_4px_0_0_var(--game-gem-deep)]",
  win: "bg-game-win text-game-on-solid shadow-[0_4px_0_0_var(--game-win-deep)]",
  epic: "bg-game-epic text-game-on-solid shadow-[0_4px_0_0_var(--game-epic-deep)]",
  neutral:
    "bg-card text-foreground border-2 border-border-strong shadow-[0_4px_0_0_var(--border-strong)]",
} as const;

const sizes = {
  sm: "h-10 px-4 text-xs gap-1.5",
  md: "h-12 px-6 text-sm gap-2",
  lg: "h-14 px-8 text-base gap-2.5",
} as const;

export type GameButtonProps = {
  children: ReactNode;
  tone?: keyof typeof tones;
  size?: keyof typeof sizes;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  full?: boolean;
  className?: string;
};

/**
 * The chunky, physically-pressable CTA of the game layer.
 *
 * The whole affordance is the 4px bottom edge: on `:active` the button
 * translates down by exactly that amount and the shadow goes to zero, so the
 * face appears to hit the surface. Translate + box-shadow only — no layout.
 *
 * Use this for the one action a screen wants you to take. Ordinary UI actions
 * should still use `ui/button.tsx`; if everything is chunky, nothing is.
 */
export function GameButton({
  children,
  tone = "primary",
  size = "md",
  icon: Icon,
  iconRight: IconRight,
  href,
  onClick,
  disabled,
  full,
  className,
}: GameButtonProps) {
  const classes = cn(
    "relative inline-flex select-none items-center justify-center overflow-hidden rounded-2xl font-extrabold tracking-tight",
    "transition-[transform,box-shadow,filter] duration-(--dur-instant) ease-standard",
    "hover:brightness-[1.06]",
    "active:translate-y-[4px] active:shadow-none",
    "focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none",
    "motion-reduce:transition-none motion-reduce:active:translate-y-0",
    tones[tone],
    sizes[size],
    full && "w-full",
    disabled && "pointer-events-none opacity-50 shadow-none",
    className,
  );

  const inner = (
    <>
      {/* Gloss sweep — the thing that makes it read as a game control. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-white/25 animate-shine"
      />
      {Icon && <Icon className="relative h-[1.1em] w-[1.1em] shrink-0" />}
      <span className="relative">{children}</span>
      {IconRight && <IconRight className="relative h-[1.1em] w-[1.1em] shrink-0" />}
    </>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={classes}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={classes}>
      {inner}
    </button>
  );
}
