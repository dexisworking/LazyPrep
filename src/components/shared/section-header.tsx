import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

const sizeStyles = {
  sm: {
    tile: "h-8 w-8 rounded-control",
    icon: "h-3.5 w-3.5",
    title: "text-sm font-semibold",
    description: "text-xs",
  },
  md: {
    tile: "h-9 w-9 rounded-control",
    icon: "h-4 w-4",
    title: "text-base font-semibold",
    description: "text-sm",
  },
  lg: {
    tile: "h-11 w-11 rounded-card",
    icon: "h-5 w-5",
    title: "text-2xl font-bold tracking-tight",
    description: "text-sm",
  },
} as const;

export type SectionHeaderProps = {
  icon?: ElementType;
  title: ReactNode;
  description?: ReactNode;
  /** Heading level. Pick the one that is correct for the document outline. */
  as?: "h1" | "h2" | "h3";
  /** Trailing slot — a button, a count, a filter. */
  action?: ReactNode;
  size?: keyof typeof sizeStyles;
  className?: string;
};

/**
 * The one section heading.
 *
 * Lifted out of `app/(dashboard)/settings/page.tsx`, where it had been defined
 * locally and never exported while eleven other places hand-rolled their own
 * variant of it in six different styles.
 *
 * `as` is explicit rather than inferred because heading order is a real
 * accessibility concern and the correct level depends on the page, not on the
 * component.
 */
export function SectionHeader({
  icon: Icon,
  title,
  description,
  as: Heading = "h2",
  action,
  size = "md",
  className,
}: SectionHeaderProps) {
  const s = sizeStyles[size];
  return (
    <div className={cn("flex items-start gap-3", className)}>
      {Icon && (
        <div
          className={cn(
            "flex flex-shrink-0 items-center justify-center border border-border-subtle bg-secondary/50",
            s.tile,
          )}
        >
          <Icon className={cn(s.icon, "text-primary")} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <Heading className={cn(s.title, "text-foreground")}>{title}</Heading>
        {description && (
          <p className={cn(s.description, "text-muted-foreground")}>{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
