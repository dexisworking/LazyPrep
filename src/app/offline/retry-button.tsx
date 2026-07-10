"use client";

import { RefreshCw } from "lucide-react";

export function RetryButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
    >
      <RefreshCw className="h-4 w-4" />
      Retry
    </button>
  );
}
