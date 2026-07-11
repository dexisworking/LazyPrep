"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Sparkles, AlertCircle, KeyRound } from "lucide-react";
import { ensurePracticeBank } from "@/lib/actions/ai-content";

/**
 * Shown on an AI course's Practice tab when it has no question bank yet.
 * Auto-generates a starter set on mount (once), then refreshes to reveal it.
 * Mirrors LessonGenerator's UX.
 */
export function PracticeBankGenerator({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error" | "no-key">("loading");
  const [message, setMessage] = useState("");
  const started = useRef(false);

  const run = () => {
    setStatus("loading");
    ensurePracticeBank(courseId).then((res) => {
      if (res.ok) {
        router.refresh();
      } else if (res.error === "no-key") {
        setStatus("no-key");
      } else {
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
      <div className="rounded-xl border border-border/50 bg-card p-8 text-center">
        <KeyRound className="mx-auto mb-3 h-8 w-8 text-np-orange" />
        <p className="font-medium text-foreground">Add your AI API key to build a practice set</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Practice questions for this course are generated with your own AI key.
        </p>
        <Link
          href="/settings"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Go to Settings
        </Link>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
        <AlertCircle className="mx-auto mb-3 h-8 w-8 text-destructive" />
        <p className="font-medium text-foreground">Couldn&apos;t build the practice set</p>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        <button
          onClick={run}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card p-10 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Sparkles className="h-6 w-6 animate-pulse text-primary" />
      </div>
      <p className="flex items-center justify-center gap-2 font-medium text-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Building your practice questions with AI…
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        This runs once for this course and takes about 10–30 seconds.
      </p>
    </div>
  );
}
