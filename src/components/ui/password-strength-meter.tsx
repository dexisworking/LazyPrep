"use client";

import { useMemo } from "react";
import { Check, Circle } from "lucide-react";

import { cn } from "@/lib/utils";

export interface PasswordRequirement {
  label: string;
  test: (pass: string) => boolean;
}

export interface PasswordStrengthMeterProps {
  password: string;
  minLength?: number;
  className?: string;
  /** Override the default four checks. */
  requirements?: PasswordRequirement[];
}

/**
 * Segmented strength bar + live requirement checklist for the sign-up form.
 *
 * Colours come from the design tokens rather than the reference's hard-coded
 * red/orange/green hex ramp, so the meter matches the rest of the auth screens
 * in both themes. Strength is derived during render — the reference kept it in
 * `useState` and synced it from an effect, which just adds a frame of lag and a
 * second source of truth for something that is a pure function of `password`.
 */
export function PasswordStrengthMeter({
  password,
  minLength = 8,
  className,
  requirements,
}: PasswordStrengthMeterProps) {
  const checks = useMemo<PasswordRequirement[]>(
    () =>
      requirements ?? [
        {
          label: `At least ${minLength} characters`,
          test: (p) => p.length >= minLength,
        },
        { label: "An uppercase letter", test: (p) => /[A-Z]/.test(p) },
        { label: "A number", test: (p) => /[0-9]/.test(p) },
        { label: "A special character", test: (p) => /[^A-Za-z0-9]/.test(p) },
      ],
    [minLength, requirements],
  );

  const met = checks.map((c) => c.test(password));
  const score = met.filter(Boolean).length;
  const levels = checks.length;

  const TONES = [
    { bar: "bg-destructive", text: "text-destructive", label: "Weak" },
    { bar: "bg-np-orange", text: "text-np-orange", label: "Fair" },
    { bar: "bg-game-xp", text: "text-game-xp", label: "Good" },
    { bar: "bg-np-success", text: "text-np-success", label: "Strong" },
  ];
  const tone = TONES[Math.max(0, Math.min(TONES.length - 1, score - 1))];

  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1" aria-hidden>
          {Array.from({ length: levels }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors duration-(--dur-base)",
                i < score ? tone.bar : "bg-secondary",
              )}
            />
          ))}
        </div>
        <span
          className={cn(
            "w-12 shrink-0 text-right text-2xs font-semibold",
            score === 0 ? "text-muted-foreground" : tone.text,
          )}
        >
          {score === 0 ? "" : tone.label}
        </span>
      </div>

      {/* The checklist is the accessible source of truth; the bar is decoration. */}
      <ul className="space-y-1" aria-live="polite">
        {checks.map((req, i) => (
          <li
            key={req.label}
            className={cn(
              "flex items-center gap-1.5 text-2xs transition-colors duration-(--dur-fast)",
              met[i] ? "text-np-success" : "text-muted-foreground",
            )}
          >
            {met[i] ? (
              <Check className="h-3 w-3 shrink-0" strokeWidth={3} aria-hidden />
            ) : (
              <Circle className="h-3 w-3 shrink-0 opacity-50" aria-hidden />
            )}
            <span>{req.label}</span>
            <span className="sr-only">{met[i] ? " — met" : " — not met"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PasswordStrengthMeter;
