"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Sparkles, AlertCircle, KeyRound, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { suggestDeepDiveTopics, spawnDeepDive } from "@/lib/actions/generate";

export function DeepDivePicker({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [phase, setPhase] = useState<"loading" | "error" | "no-key" | "ready" | "spawning">("loading");
  const [topics, setTopics] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const started = useRef(false);

  const loadTopics = () => {
    setPhase("loading");
    suggestDeepDiveTopics(courseId).then((res) => {
      if (res.ok) {
        setTopics(res.topics);
        setPhase("ready");
      } else if (res.error === "no-key") {
        setPhase("no-key");
      } else {
        setMessage(res.error ?? "Couldn't load topics.");
        setPhase("error");
      }
    });
  };

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    loadTopics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const create = () => {
    if (!selected) return;
    setPhase("spawning");
    setMessage("");
    spawnDeepDive(courseId, selected).then((res) => {
      if (res.ok) router.push(`/courses/${res.slug}`);
      else {
        setMessage(res.error ?? "Couldn't create the course.");
        setPhase("ready");
      }
    });
  };

  if (phase === "no-key") {
    return (
      <div className="rounded-xl border border-border/50 bg-card p-8 text-center">
        <KeyRound className="mx-auto mb-2 h-7 w-7 text-np-orange" />
        <p className="text-sm font-medium text-foreground">Add your AI key to build a deep-dive</p>
        <Link href="/settings" className="mt-3 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
          Go to Settings
        </Link>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
        <AlertCircle className="mx-auto mb-2 h-7 w-7 text-destructive" />
        <p className="text-sm font-medium text-foreground">Couldn&apos;t load topics</p>
        <p className="mt-1 text-xs text-muted-foreground">{message}</p>
        <button onClick={loadTopics} className="mt-3 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
          Try again
        </button>
      </div>
    );
  }

  if (phase === "loading") {
    return (
      <div className="rounded-xl border border-border/50 bg-card p-10 text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-5 w-5 animate-pulse text-primary" />
        </div>
        <p className="flex items-center justify-center gap-2 text-sm font-medium text-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Finding concepts worth mastering…
        </p>
      </div>
    );
  }

  if (phase === "spawning") {
    return (
      <div className="rounded-2xl border border-border/40 bg-card p-10 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-6 w-6 animate-pulse text-primary" />
        </div>
        <p className="flex items-center justify-center gap-2 text-sm font-medium text-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Building your deep-dive on <b>{selected}</b>…
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Starting from the basics. Takes ~15–30 seconds.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2">
        {topics.map((topic) => (
          <button
            key={topic}
            onClick={() => setSelected(topic)}
            className={cn(
              "rounded-xl border p-4 text-left text-sm font-medium transition-all",
              selected === topic
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border/60 bg-card text-foreground hover:border-primary/40",
            )}
          >
            {topic}
          </button>
        ))}
      </div>

      {message && <p className="text-sm text-destructive">{message}</p>}

      <div className="flex items-center justify-between gap-3">
        <button onClick={loadTopics} className="text-xs text-muted-foreground hover:text-foreground">
          Suggest other topics
        </button>
        <button
          onClick={create}
          disabled={!selected}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
        >
          Create deep-dive course
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
