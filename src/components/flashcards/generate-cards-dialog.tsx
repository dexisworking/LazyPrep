"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, KeyRound, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateFlashcards } from "@/lib/actions/ai-content";
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
import { Input } from "@/components/ui/input";

const COUNTS = [6, 10, 15, 20];

/**
 * "Generate more cards with AI" — creates private flashcards for this user
 * from the course's coverage using their BYO key.
 */
export function GenerateCardsDialog({
  courseId,
  hasAiKey,
}: {
  courseId: string;
  hasAiKey: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(10);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState<number | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    const res = await generateFlashcards(courseId, { topic: topic.trim() || undefined, count });
    setLoading(false);
    if (res.ok) {
      setAdded(res.added);
      router.refresh();
    } else {
      setError(res.error === "no-key" ? "Add an AI key in Settings first." : res.error);
    }
  };

  const reset = (o: boolean) => {
    setOpen(o);
    if (!o) {
      setError(null);
      setAdded(null);
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogTrigger
        render={
          <button className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-all hover:bg-primary/20 active:scale-[0.98]" />
        }
      >
        <Sparkles className="h-4 w-4" />
        Generate more with AI
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate flashcards with AI</DialogTitle>
          <DialogDescription>
            New cards are created from this course&apos;s coverage, are private to you, and join
            your review queue as new cards. Uses your own API key.
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
        ) : added !== null ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-np-success/30 bg-np-success/[0.06] p-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-np-success" />
            <p className="font-semibold text-foreground">{added} new cards added!</p>
            <p className="text-sm text-muted-foreground">
              They&apos;re in your queue as new cards — start reviewing whenever you like.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">How many cards?</p>
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
              <p className="mb-2 text-sm font-medium text-foreground">
                Focus topic <span className="font-normal text-muted-foreground">(optional)</span>
              </p>
              <Input
                placeholder="e.g. Subnetting, OSPF, Port numbers…"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="h-10"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}

        <DialogFooter>
          <DialogClose
            render={
              <button className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary" />
            }
          >
            {added !== null ? "Done" : "Cancel"}
          </DialogClose>
          {hasAiKey && added === null && (
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate {count} cards
                </>
              )}
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
