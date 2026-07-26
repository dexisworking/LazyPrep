"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  // The server can't know the resolved theme, so the label stays generic until
  // hydration. `useSyncExternalStore` gives a hydration-safe "am I on the
  // client yet" read without a setState-in-effect round trip.
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      // `resolvedTheme`, not `theme`: with defaultTheme="dark" + enableSystem,
      // `theme` reads "system" on first load, so the old check sent the first
      // click to light even when the page was already light.
      onClick={() => setTheme(isDark ? "light" : "dark")}
      // `relative` is required — the Moon below is absolutely positioned and
      // would otherwise resolve against the nearest positioned ancestor.
      className="relative text-muted-foreground hover:text-foreground"
      aria-label={
        mounted ? `Switch to ${isDark ? "light" : "dark"} mode` : "Toggle theme"
      }
    >
      <Sun className="size-5 rotate-0 scale-100 transition-transform duration-(--dur-base) ease-emphasized dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute size-5 rotate-90 scale-0 transition-transform duration-(--dur-base) ease-emphasized dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
