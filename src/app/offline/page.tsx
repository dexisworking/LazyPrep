import type { Metadata } from "next";
import { WifiOff } from "lucide-react";
import { LogoMark, Wordmark } from "@/components/brand/logo";
import { RetryButton } from "./retry-button";

export const metadata: Metadata = {
  title: "Offline",
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="flex items-center gap-2">
        <LogoMark className="h-8 w-8" />
        <Wordmark className="text-xl" />
      </div>
      <div className="mt-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-border/50 bg-card">
        <WifiOff className="h-7 w-7 text-muted-foreground" />
      </div>
      <h1 className="mt-6 text-xl font-bold text-foreground">You&apos;re offline</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        NetPrep needs a connection to load your courses and progress. Check your
        network and try again.
      </p>
      <RetryButton />
    </div>
  );
}
