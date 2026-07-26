import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/motion/motion";

const tones = {
  neutral: "text-muted-foreground",
  primary: "text-primary",
  orange: "text-np-orange",
  success: "text-np-success",
  red: "text-np-red",
  xp: "text-np-xp",
  streak: "text-streak-hot",
} as const;

const sizes = {
  sm: { box: "p-card-sm", value: "text-xl", label: "text-2xs" },
  md: { box: "p-card", value: "text-2xl", label: "text-xs" },
} as const;

export type StatTileProps = {
  label: ReactNode;
  value: number | string;
  suffix?: string;
  prefix?: string;
  icon?: LucideIcon;
  tone?: keyof typeof tones;
  /** Count up on first view. Ignored for string values and under reduced motion. */
  animate?: boolean;
  /** Renders the tile as a link. */
  href?: string;
  size?: keyof typeof sizes;
  className?: string;
};

/**
 * The one stat tile — label + optional icon + big number.
 *
 * Replaces five independent treatments of the same object across the dashboard,
 * profile, streak panel and exam plan card. Only the dashboard's version
 * animated its number; now every tile can.
 */
export function StatTile({
  label,
  value,
  suffix = "",
  prefix = "",
  icon: Icon,
  tone = "neutral",
  animate = true,
  href,
  size = "md",
  className,
}: StatTileProps) {
  const s = sizes[size];
  const numeric = typeof value === "number";

  const body = (
    <>
      <div className="flex items-center gap-2 text-muted-foreground">
        {Icon && <Icon className={cn("h-4 w-4 shrink-0", tones[tone])} aria-hidden />}
        <span className={cn(s.label, "font-medium")}>{label}</span>
      </div>
      <p className={cn("mt-2 font-bold tabular-nums text-foreground", s.value)}>
        {animate && numeric ? (
          <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
        ) : (
          `${prefix}${value}${suffix}`
        )}
      </p>
    </>
  );

  const classes = cn(
    "block rounded-card border border-border-subtle bg-card",
    s.box,
    href &&
      "transition-[border-color,box-shadow] duration-(--dur-fast) ease-standard hover:border-primary/40 hover:shadow-raised",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {body}
      </Link>
    );
  }
  return <div className={classes}>{body}</div>;
}
