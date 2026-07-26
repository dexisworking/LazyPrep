import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Action = {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: LucideIcon;
};

const sizes = {
  sm: { box: "p-6", puck: "h-10 w-10", icon: "h-4 w-4", title: "text-sm", body: "text-xs" },
  md: { box: "p-8", puck: "h-12 w-12", icon: "h-5 w-5", title: "text-base", body: "text-sm" },
  lg: { box: "p-10", puck: "h-14 w-14", icon: "h-6 w-6", title: "text-lg", body: "text-sm" },
} as const;

export type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: Action;
  secondaryAction?: Action;
  /** `dashed` = nothing here yet. `solid` = a real terminal state. `inline` = inside a card. */
  variant?: "dashed" | "solid" | "inline";
  size?: keyof typeof sizes;
  className?: string;
};

function ActionButton({ action, variant }: { action: Action; variant: "default" | "outline" }) {
  const Icon = action.icon;
  const content = (
    <>
      {Icon && <Icon />}
      {action.label}
    </>
  );
  if (action.href) {
    return (
      <Button variant={variant} render={<Link href={action.href} />}>
        {content}
      </Button>
    );
  }
  return (
    <Button variant={variant} onClick={action.onClick}>
      {content}
    </Button>
  );
}

/**
 * The one empty state.
 *
 * Replaces nine inline variants that disagreed on radius (xl/2xl), padding
 * (p-6/p-8/p-10/p-12), and icon treatment (bare / circle puck / none at all) —
 * three of which were a bare sentence of muted text with no icon or CTA.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  variant = "dashed",
  size = "md",
  className,
}: EmptyStateProps) {
  const s = sizes[size];
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-center",
        s.box,
        variant === "dashed" && "rounded-card border border-dashed border-border bg-card/40",
        variant === "solid" && "rounded-card border border-border-subtle bg-card",
        className,
      )}
    >
      {Icon && (
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-muted text-muted-foreground",
            s.puck,
          )}
        >
          <Icon className={s.icon} aria-hidden />
        </div>
      )}
      <div className="space-y-1">
        <p className={cn(s.title, "font-semibold text-foreground")}>{title}</p>
        {description && (
          <p className={cn(s.body, "mx-auto max-w-prose text-muted-foreground")}>
            {description}
          </p>
        )}
      </div>
      {(action || secondaryAction) && (
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
          {action && <ActionButton action={action} variant="default" />}
          {secondaryAction && <ActionButton action={secondaryAction} variant="outline" />}
        </div>
      )}
    </div>
  );
}
