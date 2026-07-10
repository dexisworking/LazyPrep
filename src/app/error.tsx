"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

export default function RootError({
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <p className="text-6xl font-black tracking-tighter text-foreground/10">500</p>
      <h1 className="mt-4 text-xl font-bold text-foreground">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        An unexpected error occurred. It&apos;s usually temporary — try again.
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
