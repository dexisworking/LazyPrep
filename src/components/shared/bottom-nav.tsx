"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { navRoutes, isRouteActive } from "@/lib/nav";

/**
 * App-style bottom tab bar — mobile only. Primary destinations from
 * `lib/nav.ts`; the active tab gets a layout-animated indicator pill.
 * Safe-area padding keeps it clear of the iOS home bar in standalone mode.
 */
export function BottomNav() {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const tabs = navRoutes.filter((r) => r.mobilePrimary);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/50 bg-background/85 backdrop-blur-lg md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Primary"
    >
      <div className="mx-auto flex h-16 max-w-md items-stretch">
        {tabs.map((route) => {
          const active = isRouteActive(pathname, route.href);
          return (
            <Link
              key={route.href}
              href={route.href}
              data-tour={`nav-${route.href.slice(1)}`}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors active:scale-95",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <span className="relative flex h-7 w-12 items-center justify-center">
                {active && (
                  <motion.span
                    layoutId="bottom-nav-active"
                    className="absolute inset-0 rounded-full bg-primary/15"
                    transition={
                      reduced
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 400, damping: 32 }
                    }
                  />
                )}
                <route.icon
                  className={cn("relative h-5 w-5", active ? route.color : "")}
                />
              </span>
              {route.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
