"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AiKeyGate } from "@/components/shared/ai-key-gate";
import { AITextLoading } from "@/components/ui/ai-text-loading";
import { AILoadingState, type LoadingSequence } from "@/components/ui/ai-loading-state";

/** What a generation action resolves to. Mirrors the server actions' shape. */
export type GeneratorResult = { ok: boolean; error?: string };

const tones = {
  primary: { puck: "bg-primary/10", icon: "text-primary" },
  success: { puck: "bg-np-success/10", icon: "text-np-success" },
  orange: { puck: "bg-np-orange/10", icon: "text-np-orange" },
  red: { puck: "bg-np-red/10", icon: "text-np-red" },
} as const;

const sizes = {
  sm: { box: "p-6", puck: "h-10 w-10", icon: "h-5 w-5" },
  md: { box: "p-10", puck: "h-12 w-12", icon: "h-6 w-6" },
} as const;

export type GeneratorPanelProps = {
  /** The server action, already bound to its arguments by the caller. */
  run: () => Promise<GeneratorResult>;
  /** Start on mount. Set false to require a click. */
  autoStart?: boolean;
  /**
   * Client-side fail-safe. Without it a killed server action (504 past the
   * function limit, dropped network) leaves the spinner up forever — which is
   * what three of the five original generators did.
   */
  timeoutMs?: number;
  /** Defaults to `router.refresh()`. */
  onSuccess?: () => void;
  labels: {
    loading: string;
    loadingHint?: string;
    errorTitle: string;
    noKeyTitle?: string;
    noKeyHint?: string;
  };
  icon?: LucideIcon;
  tone?: keyof typeof tones;
  size?: keyof typeof sizes;
  className?: string;
  /**
   * How the wait is dramatised.
   *
   * `shimmer` is the original bar. `text` cycles a shimmering status line and
   * suits a single-shot generation (one lesson, one course). `console` narrates
   * multi-phase work and is what the flashcard / practice-bank builds use —
   * those genuinely do several passes and a static line undersells them.
   */
  loadingVariant?: "shimmer" | "text" | "console";
  /** Status lines for `loadingVariant="text"`. Falls back to `labels.loading`. */
  loadingTexts?: string[];
  /** Phases for `loadingVariant="console"`. Required by that variant. */
  loadingSequences?: LoadingSequence[];
};

/**
 * The one "AI is making something" panel.
 *
 * Collapses five near-identical components (~437 lines) that differed only in
 * which server action they called, their icon, their copy and, accidentally,
 * whether they had a timeout at all.
 *
 * It never imports from `lib/actions` — the caller passes a bound closure — so
 * this stays a pure presentation component.
 */
export function GeneratorPanel({
  run,
  autoStart = true,
  timeoutMs = 75_000,
  onSuccess,
  labels,
  icon: Icon = Sparkles,
  tone = "primary",
  size = "md",
  className,
  loadingVariant = "text",
  loadingTexts,
  loadingSequences,
}: GeneratorPanelProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "no-key">(
    autoStart ? "loading" : "idle",
  );
  const [message, setMessage] = useState("");
  const started = useRef(false);

  // Keep the latest callbacks without making `start` depend on them, so the
  // auto-start effect stays a true once-per-mount.
  const runRef = useRef(run);
  const successRef = useRef(onSuccess);
  useEffect(() => {
    runRef.current = run;
    successRef.current = onSuccess;
  });

  const start = useCallback(() => {
    setStatus("loading");
    setMessage("");

    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      setStatus("error");
      setMessage("This is taking longer than expected. Please try again.");
    }, timeoutMs);

    runRef
      .current()
      .then((res) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (res.ok) {
          if (successRef.current) successRef.current();
          else router.refresh();
        } else if (res.error === "no-key") {
          setStatus("no-key");
        } else {
          setStatus("error");
          setMessage(res.error ?? "Generation failed.");
        }
      })
      .catch(() => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        setStatus("error");
        setMessage("Generation failed. Please try again.");
      });
  }, [router, timeoutMs]);

  useEffect(() => {
    if (!autoStart || started.current) return;
    started.current = true;
    start();
  }, [autoStart, start]);

  if (status === "no-key") {
    return (
      <AiKeyGate
        title={labels.noKeyTitle}
        description={labels.noKeyHint}
        size={size}
        className={className}
      />
    );
  }

  const s = sizes[size];
  const t = tones[tone];

  if (status === "error") {
    return (
      <div
        className={cn(
          "rounded-card border border-destructive/30 bg-destructive/5 text-center",
          s.box,
          className,
        )}
        role="alert"
      >
        <div
          className={cn(
            "mx-auto mb-3 flex items-center justify-center rounded-full bg-destructive/10",
            s.puck,
          )}
        >
          <AlertCircle className={cn(s.icon, "text-destructive")} aria-hidden />
        </div>
        <p className="font-medium text-foreground">{labels.errorTitle}</p>
        {message && <p className="mt-1 text-sm text-muted-foreground">{message}</p>}
        <Button className="mt-4" onClick={start}>
          Try again
        </Button>
      </div>
    );
  }

  if (status === "idle") {
    return (
      <div
        className={cn(
          "rounded-card border border-border-subtle bg-card text-center",
          s.box,
          className,
        )}
      >
        <div className={cn("mx-auto mb-3 flex items-center justify-center rounded-full", t.puck, s.puck)}>
          <Icon className={cn(s.icon, t.icon)} aria-hidden />
        </div>
        <p className="font-medium text-foreground">{labels.loading}</p>
        {labels.loadingHint && (
          <p className="mt-1 text-sm text-muted-foreground">{labels.loadingHint}</p>
        )}
        <Button className="mt-4" onClick={start}>
          <Sparkles />
          Generate
        </Button>
      </div>
    );
  }

  // `text` and `console` both render their own headline; only the bare shimmer
  // needs the static one, otherwise the same sentence appears twice.
  const showHeadline = loadingVariant === "shimmer";

  return (
    <div
      className={cn(
        "rounded-card border border-border-subtle bg-card text-center",
        s.box,
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          "mx-auto mb-4 flex items-center justify-center rounded-full",
          t.puck,
          s.puck,
        )}
      >
        <Icon className={cn(s.icon, t.icon, "animate-streak-breathe")} aria-hidden />
      </div>

      {showHeadline && <p className="font-medium text-foreground">{labels.loading}</p>}

      {loadingVariant === "text" && (
        <AITextLoading
          texts={loadingTexts ?? [labels.loading]}
          className="mt-3 text-base"
        />
      )}

      {loadingVariant === "console" && loadingSequences && (
        <div className="mt-1 flex justify-center text-left">
          <AILoadingState sequences={loadingSequences} />
        </div>
      )}

      {labels.loadingHint && (
        <p className="mt-3 text-sm text-muted-foreground">{labels.loadingHint}</p>
      )}

      {loadingVariant === "shimmer" && (
        // Indeterminate sweep — the wait is 10–30s and a spinner alone reads as stalled.
        <div className="mx-auto mt-5 h-1 w-40 overflow-hidden rounded-full bg-secondary">
          <div className="h-full w-1/3 rounded-full bg-primary animate-generator-sweep" />
        </div>
      )}
    </div>
  );
}
