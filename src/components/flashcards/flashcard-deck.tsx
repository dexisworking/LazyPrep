"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  RotateCcw,
  Sparkles,
  Check,
  Repeat,
  Zap,
  MousePointerClick,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { recordFlashcardReview } from "@/lib/actions/flashcards";
import type { FlashcardData } from "@/lib/data/flashcards";

export function FlashcardDeck({
  cards,
  backHref,
}: {
  cards: FlashcardData[];
  backHref: string;
}) {
  const router = useRouter();
  const [order, setOrder] = useState<number[]>(() => cards.map((_, i) => i));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [learning, setLearning] = useState(0);
  const [finished, setFinished] = useState(false);
  const [xpEarned, setXpEarned] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  // Shuffle once on the client to avoid a server/client hydration mismatch.
  useEffect(() => {
    setOrder((prev) => [...prev].sort(() => Math.random() - 0.5));
  }, []);

  const finish = (knownCount: number, learningCount: number) => {
    setFinished(true);
    const total = knownCount + learningCount;
    startTransition(async () => {
      const result = await recordFlashcardReview(total);
      setXpEarned(result.xpAwarded);
      router.refresh();
    });
  };

  const advance = (gotIt: boolean) => {
    const nextKnown = known + (gotIt ? 1 : 0);
    const nextLearning = learning + (gotIt ? 0 : 1);
    if (gotIt) setKnown(nextKnown);
    else setLearning(nextLearning);

    if (index === order.length - 1) {
      finish(nextKnown, nextLearning);
      return;
    }
    setIndex((i) => i + 1);
    setFlipped(false);
  };

  const restart = () => {
    setOrder((prev) => [...prev].sort(() => Math.random() - 0.5));
    setIndex(0);
    setFlipped(false);
    setKnown(0);
    setLearning(0);
    setFinished(false);
    setXpEarned(null);
  };

  // Space flips the current card.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && !finished) {
        e.preventDefault();
        setFlipped((f) => !f);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [finished]);

  if (cards.length === 0) {
    return (
      <div className="rounded-xl border border-border/50 bg-card p-10 text-center text-muted-foreground">
        No flashcards for this course yet.
      </div>
    );
  }

  if (finished) {
    const total = known + learning;
    return (
      <div className="mx-auto max-w-lg space-y-6 rounded-2xl border border-border/40 bg-card p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-8 w-8 text-np-orange" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Deck complete!</h2>
          <p className="mt-1 text-muted-foreground">
            You reviewed {total} card{total === 1 ? "" : "s"} — {known} known, {learning} to revisit
          </p>
        </div>
        {xpEarned !== null && (
          <div className="flex items-center justify-center gap-2 text-np-xp">
            <Zap className="h-5 w-5" />
            <span className="text-lg font-semibold">+{xpEarned} XP earned</span>
          </div>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={restart}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
          >
            <RotateCcw className="h-4 w-4" />
            Shuffle & repeat
          </button>
          <Link
            href={backHref}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            Done
          </Link>
        </div>
      </div>
    );
  }

  const card = cards[order[index]];
  const progress = ((index + (flipped ? 0.5 : 0)) / order.length) * 100;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Card {index + 1} of {order.length}
          </span>
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-np-success">
              <Check className="h-4 w-4" />
              {known}
            </span>
            <span className="flex items-center gap-1 text-np-orange">
              <Repeat className="h-4 w-4" />
              {learning}
            </span>
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Flip card */}
      <button
        onClick={() => setFlipped((f) => !f)}
        className="group block w-full [perspective:1200px]"
        aria-label="Flip card"
      >
        <div
          className={cn(
            "relative min-h-[16rem] w-full transition-transform duration-500 [transform-style:preserve-3d]",
            flipped && "[transform:rotateY(180deg)]",
          )}
        >
          {/* Front */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl border border-border/60 bg-card p-8 text-center [backface-visibility:hidden]">
            <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
              {card.topic}
            </span>
            <p className="text-xl font-semibold text-foreground">{card.front}</p>
            <span className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <MousePointerClick className="h-3.5 w-3.5" />
              Click or press Space to flip
            </span>
          </div>

          {/* Back */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl border border-primary/40 bg-primary/5 p-8 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <span className="text-[10px] font-medium uppercase tracking-wide text-primary">Answer</span>
            <p className="text-lg font-medium leading-relaxed text-foreground">{card.back}</p>
          </div>
        </div>
      </button>

      {/* Rating buttons (after flip) */}
      <div
        className={cn(
          "flex items-center justify-center gap-3 transition-opacity",
          flipped ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <button
          onClick={() => advance(false)}
          className="inline-flex items-center gap-2 rounded-lg border border-np-orange/40 bg-np-orange/10 px-5 py-2.5 text-sm font-semibold text-np-orange transition-all hover:bg-np-orange/20"
        >
          <Repeat className="h-4 w-4" />
          Still learning
        </button>
        <button
          onClick={() => advance(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-np-success/40 bg-np-success/10 px-5 py-2.5 text-sm font-semibold text-np-success transition-all hover:bg-np-success/20"
        >
          <Check className="h-4 w-4" />
          Got it
        </button>
      </div>
    </div>
  );
}
