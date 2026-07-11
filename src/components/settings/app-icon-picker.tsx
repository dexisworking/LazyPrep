"use client";

import { useEffect, useState } from "react";
import { Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ICON_VARIANTS,
  applyAppIcon,
  getStoredIcon,
  iconPreviewSrc,
  type IconVariant,
} from "@/lib/app-icon";

/**
 * App-icon chooser. Picking a variant persists it and updates the served
 * icon links so it's used when the user (re)adds/reinstalls NetPrep to their
 * home screen. Installed icons can't change live (no web API) — the copy says so.
 */
export function AppIconPicker() {
  const [selected, setSelected] = useState<IconVariant>("gradient");
  const [mounted, setMounted] = useState(false);

  // Read the saved choice after mount to avoid a hydration mismatch.
  useEffect(() => {
    setSelected(getStoredIcon());
    setMounted(true);
  }, []);

  const choose = (v: IconVariant) => {
    setSelected(v);
    applyAppIcon(v);
  };

  return (
    <div className="space-y-4 rounded-xl border border-border/50 bg-card p-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ICON_VARIANTS.map((v) => {
          const active = mounted && selected === v.key;
          return (
            <button
              key={v.key}
              type="button"
              onClick={() => choose(v.key)}
              aria-pressed={active}
              className={cn(
                "group flex flex-col items-center gap-2 rounded-xl border p-3 transition-all active:scale-[0.98]",
                active
                  ? "border-primary bg-primary/5 ring-2 ring-primary/40"
                  : "border-border/60 hover:border-primary/40 hover:bg-secondary/40",
              )}
            >
              <span className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={iconPreviewSrc(v.key)}
                  alt={`${v.label} app icon`}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-[14px] shadow-sm"
                />
                {active && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "text-xs font-medium",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {v.label}
              </span>
            </button>
          );
        })}
      </div>

      <p className="flex items-start gap-2 rounded-lg border border-border/40 bg-secondary/40 p-3 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />
        <span>
          Your pick applies when you <b className="text-foreground">add NetPrep to your home
          screen</b> (iOS: Share → Add to Home Screen; Android: Install app). Phones can&apos;t
          repaint an icon that&apos;s already installed — remove and re-add to switch.
        </span>
      </p>
    </div>
  );
}
