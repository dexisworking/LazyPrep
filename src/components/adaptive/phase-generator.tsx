"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Sparkles, AlertCircle, KeyRound } from "lucide-react";
import { generatePhase } from "@/lib/actions/generate";

/**
 * Auto-generates a newly-unlocked phase's lessons on view (adaptive: tailored to
 * what the learner covered and their checkpoint weak spots).
 */
export function PhaseGenerator({ moduleId, phaseTitle }: { moduleId: string; phaseTitle: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error" | "no-key">("loading");
  const [message, setMessage] = useState("");
  const started = useRef(false);

  const run = () => {
    setStatus("loading");
    generatePhase(moduleId).then((res) => {
      if (res.ok) router.refresh();
      else if (res.error === "no-key") setStatus("no-key");
      else {
        setStatus("error");
        setMessage(res.error ?? "Generation failed.");
      }
    });
  };

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "no-key") {
    return (
      <div className="rounded-xl border border-border/50 bg-card p-6 text-center">
        <KeyRound className="mx-auto mb-2 h-7 w-7 text-np-orange" />
        <p className="text-sm font-medium text-foreground">Add your AI key to build this phase</p>
        <Link href="/settings" className="mt-3 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
          Go to Settings
        </Link>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <AlertCircle className="mx-auto mb-2 h-7 w-7 text-destructive" />
        <p className="text-sm font-medium text-foreground">Couldn&apos;t build this phase</p>
        <p className="mt-1 text-xs text-muted-foreground">{message}</p>
        <button onClick={run} className="mt-3 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card p-8 text-center">
      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
        <Sparkles className="h-5 w-5 animate-pulse text-primary" />
      </div>
      <p className="flex items-center justify-center gap-2 text-sm font-medium text-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Building your {phaseTitle} phase…
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Tailored to what you&apos;ve learned and where you struggled. Takes ~15–30 seconds.
      </p>
    </div>
  );
}
