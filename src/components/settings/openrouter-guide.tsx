"use client";

import { useState } from "react";
import { ChevronDown, ExternalLink, HelpCircle } from "lucide-react";

import { cn } from "@/lib/utils";

type Step = {
  title: string;
  body: React.ReactNode;
  link?: { href: string; label: string };
};

const STEPS: Step[] = [
  {
    title: "Create an OpenRouter account",
    body: "Sign up with Google, GitHub or email. It's free, and you can start on free models without adding a card.",
    link: { href: "https://openrouter.ai", label: "openrouter.ai" },
  },
  {
    title: "Open your API keys page",
    body: "From your account menu, go to Keys (under Settings). This is where every key you issue is listed.",
    link: { href: "https://openrouter.ai/settings/keys", label: "openrouter.ai/settings/keys" },
  },
  {
    title: "Create a new key",
    body: (
      <>
        Choose <span className="font-medium text-foreground">Create Key</span>, give it a name you&apos;ll
        recognise later — <span className="font-medium text-foreground">LazyPrep</span> works — and
        optionally set a credit limit so this key can never spend more than you intend.
      </>
    ),
  },
  {
    title: "Copy it straight away",
    body: (
      <>
        The key starts with <code className="rounded bg-secondary px-1 py-0.5 font-mono text-2xs">sk-or-v1-</code>{" "}
        and is shown <span className="font-medium text-foreground">only once</span>. If you navigate
        away without copying it, delete it and issue a new one — it can&apos;t be revealed again.
      </>
    ),
  },
  {
    title: "Pick a model (and add credits if it's a paid one)",
    body: "Free models are enough to try things out. Paid models are cheaper and better for full course generation — top up a few dollars of credit and it goes a long way.",
    link: { href: "https://openrouter.ai/models", label: "Browse models & pricing" },
  },
  {
    title: "Paste it below and save",
    body: (
      <>
        Drop the key in the field below, leave the base URL as{" "}
        <code className="rounded bg-secondary px-1 py-0.5 font-mono text-2xs">
          https://openrouter.ai/api/v1
        </code>
        , choose your model, then hit{" "}
        <span className="font-medium text-foreground">Validate &amp; Save</span>. We make one test
        call to confirm it works before storing it.
      </>
    ),
  },
];

/**
 * First-run walkthrough for getting an OpenRouter key.
 *
 * Rendered only when no key is configured — once you're connected it's noise.
 * Steps are worded against durable concepts (the Keys page, "Create Key", the
 * `sk-or-v1-` prefix) rather than transcribing OpenRouter's current UI
 * verbatim, so a redesign on their side doesn't immediately make this wrong.
 */
export function OpenRouterGuide() {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-control border border-primary/25 bg-primary/[0.04]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 p-4 text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control border border-primary/20 bg-primary/10">
          <HelpCircle className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">
            Don&apos;t have a key? Here&apos;s how to get one
          </p>
          <p className="text-xs text-muted-foreground">
            Six steps, about two minutes, on openrouter.ai
          </p>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-(--dur-base) ease-emphasized motion-reduce:transition-none",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <ol className="space-y-3 border-t border-primary/15 p-4 pt-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xs font-bold tabular-nums text-primary">
                {i + 1}
              </span>
              <div className="min-w-0 space-y-1 pt-0.5">
                <p className="text-sm font-medium text-foreground">{step.title}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{step.body}</p>
                {step.link && (
                  <a
                    href={step.link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    {step.link.label}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
