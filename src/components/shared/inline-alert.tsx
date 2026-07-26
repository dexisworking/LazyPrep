"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const tones = {
  info: { box: "border-primary/25 bg-primary/[0.06] text-foreground", accent: "text-primary", icon: Info },
  success: { box: "border-np-success/25 bg-np-success/[0.06] text-foreground", accent: "text-np-success", icon: CheckCircle2 },
  warning: { box: "border-np-orange/25 bg-np-orange/[0.06] text-foreground", accent: "text-np-orange", icon: AlertTriangle },
  error: { box: "border-destructive/25 bg-destructive/[0.06] text-foreground", accent: "text-destructive", icon: XCircle },
} as const;

export type InlineAlertProps = {
  tone?: keyof typeof tones;
  title?: ReactNode;
  children?: ReactNode;
  /** Override the default icon for the tone. Pass `null` to drop it. */
  icon?: LucideIcon | null;
  dismissible?: boolean;
  className?: string;
};

/**
 * The one inline message — form errors, generation failures, saved-confirmations.
 *
 * Replaces nine hand-rolled error blocks plus four `setTimeout`-driven
 * success banners. Deliberately inline rather than a toast: every existing call
 * site is anchored to the thing it describes, and a portal/provider would be
 * net-new surface area for zero current callers.
 *
 * `role` is `alert` for error/warning (interrupts) and `status` for info/success
 * (polite), so screen readers get the urgency right.
 */
export function InlineAlert({
  tone = "info",
  title,
  children,
  icon,
  dismissible = false,
  className,
}: InlineAlertProps) {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  const t = tones[tone];
  const Icon = icon === null ? null : (icon ?? t.icon);
  const urgent = tone === "error" || tone === "warning";

  return (
    <div
      role={urgent ? "alert" : "status"}
      aria-live={urgent ? "assertive" : "polite"}
      className={cn(
        "flex items-start gap-2.5 rounded-control border p-3 text-sm",
        t.box,
        className,
      )}
    >
      {Icon && <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", t.accent)} aria-hidden />}
      <div className="min-w-0 flex-1 space-y-0.5">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="text-muted-foreground">{children}</div>}
      </div>
      {dismissible && (
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Dismiss"
          className="-m-1 shrink-0 rounded-control p-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
