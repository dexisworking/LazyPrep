"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Button, type buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";

type ButtonSize = VariantProps<typeof buttonVariants>["size"];

export type ConfirmButtonProps = {
  label: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Shown alongside the confirm/cancel pair to explain the consequence. */
  hint?: ReactNode;
  onConfirm: () => void;
  pending?: boolean;
  tone?: "primary" | "destructive";
  icon?: LucideIcon;
  size?: ButtonSize;
  className?: string;
};

/**
 * Two-tap confirmation for a consequential action.
 *
 * Owns *only* the reveal — the caller keeps its own submit handler, re-entrancy
 * guards and pending state and passes them in. That separation matters most for
 * the mock-test runner, whose submit path also has to survive the auto-submit
 * timer firing.
 *
 * Auto-reverts after 6s so a half-confirmed control doesn't sit armed.
 */
export function ConfirmButton({
  label,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  hint,
  onConfirm,
  pending = false,
  tone = "destructive",
  icon: Icon,
  size,
  className,
}: ConfirmButtonProps) {
  const [armed, setArmed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!armed) return;
    timer.current = setTimeout(() => setArmed(false), 6000);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [armed]);

  if (!armed) {
    return (
      <Button
        variant={tone === "destructive" ? "destructive" : "default"}
        size={size}
        disabled={pending}
        onClick={() => setArmed(true)}
        className={className}
      >
        {Icon && <Icon />}
        {label}
      </Button>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      <Button
        variant={tone === "destructive" ? "destructive-solid" : "default"}
        size={size}
        disabled={pending}
        onClick={onConfirm}
      >
        {pending && <Loader2 className="animate-spin" />}
        {confirmLabel}
      </Button>
      <Button
        variant="ghost"
        size={size}
        disabled={pending}
        onClick={() => setArmed(false)}
      >
        {cancelLabel}
      </Button>
    </div>
  );
}
