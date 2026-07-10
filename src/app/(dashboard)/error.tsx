"use client";

import { useEffect } from "react";
import { RefreshCw, WifiOff } from "lucide-react";

/**
 * Dashboard error boundary. The most common production failure is the Neon
 * free-tier compute waking from suspend (transient connection error), so the
 * copy leads with "try again" rather than alarming the user.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border/50 bg-card">
        <WifiOff className="h-7 w-7 text-muted-foreground" />
      </div>
      <h2 className="mt-6 text-xl font-bold text-foreground">Couldn&apos;t load this page</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        This is usually a brief connection hiccup while the database wakes up.
        It resolves in a few seconds.
      </p>
      <button
        onClick={reset}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
      >
        <RefreshCw className="h-4 w-4" />
        Try again
      </button>
      {error.digest && (
        <p className="mt-4 text-[10px] uppercase tracking-widest text-muted-foreground/60">
          Ref: {error.digest}
        </p>
      )}
    </div>
  );
}
