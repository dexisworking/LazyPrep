"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, KeyRound, TimerIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { createMockTest } from "@/lib/actions/ai-content";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const COUNTS = [10, 15, 20, 30];
const DIFFICULTIES = [
  { value: "mixed", label: "Mixed" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
] as const;

type Difficulty = (typeof DIFFICULTIES)[number]["value"];

/** Builds a new AI mock test and navigates straight into it. */
export function GenerateMockDialog({
  courseId,
  courseSlug,
  hasAiKey,
}: {
  courseId: string;
  courseSlug: string;
  hasAiKey: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(15);
  const [difficulty, setDifficulty] = useState<Difficulty>("mixed");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    const res = await createMockTest(courseId, { count, difficulty });
    if (res.ok) {
      router.push(`/practice/${courseSlug}/mocks/${res.testId}`);
      // Keep the spinner while navigating.
      return;
    }
    setLoading(false);
    setError(res.error === "no-key" ? "Add an AI key in Settings first." : res.error);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setError(null);
      }}
    >
      <DialogTrigger
        render={
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]" />
        }
      >
        <Sparkles className="h-4 w-4" />
        New mock test
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate a mock test</DialogTitle>
          <DialogDescription>
            AI builds a fresh timed exam from this course&apos;s coverage using your own API key.
            Questions are yours alone and can be retaken anytime.
          </DialogDescription>
        </DialogHeader>

        {!hasAiKey ? (
          <div className="flex flex-col items-start gap-3 rounded-lg border border-np-orange/30 bg-np-orange/[0.06] p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <KeyRound className="h-4 w-4 text-np-orange" />
              You need an AI key first
            </p>
            <p className="text-sm text-muted-foreground">
              Add your OpenRouter (or any OpenAI-compatible) key in Settings — it stays encrypted
              and is only used for your own generations.
            </p>
            <Link
              href="/settings"
              className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
            >
              Go to Settings
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Questions</p>
              <div className="grid grid-cols-4 gap-2">
                {COUNTS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCount(c)}
                    className={cn(
                      "rounded-lg border py-2 text-sm font-semibold transition-all active:scale-[0.97]",
                      count === c
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border/70 bg-card text-muted-foreground hover:border-primary/40",
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Difficulty</p>
              <div className="grid grid-cols-4 gap-2">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDifficulty(d.value)}
                    className={cn(
                      "rounded-lg border py-2 text-sm font-semibold transition-all active:scale-[0.97]",
                      difficulty === d.value
                        ? "border-np-orange bg-np-orange/15 text-np-orange"
                        : "border-border/70 bg-card text-muted-foreground hover:border-np-orange/40",
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TimerIcon className="h-3.5 w-3.5" />
              Timed at ~72s per question ({Math.max(5, Math.round((count * 72) / 60))} min) — exam
              pace.
            </p>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}

        <DialogFooter>
          <DialogClose
            render={
              <button className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary" />
            }
          >
            Cancel
          </DialogClose>
          {hasAiKey && (
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Building your exam…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate test
                </>
              )}
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
