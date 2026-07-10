"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Loader2,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { generateCourse } from "@/lib/actions/generate";
import type { Questionnaire, CourseLevel, CourseDepth } from "@/lib/ai/types";

const CATEGORIES = [
  { value: "certification", label: "Certification" },
  { value: "college", label: "College course" },
  { value: "competitive", label: "Competitive exam" },
  { value: "custom", label: "Custom topic" },
];

const LEVELS: { value: CourseLevel; label: string; hint: string }[] = [
  { value: "beginner", label: "Beginner", hint: "New to the subject" },
  { value: "intermediate", label: "Intermediate", hint: "Some background" },
  { value: "advanced", label: "Advanced", hint: "Deep dive" },
  { value: "exam-prep", label: "Exam prep", hint: "Cramming for a test" },
];

const DEPTHS: { value: CourseDepth; label: string; hint: string }[] = [
  { value: "concise", label: "Concise", hint: "Short, scannable lessons" },
  { value: "balanced", label: "Balanced", hint: "A solid middle ground" },
  { value: "in-depth", label: "In-depth", hint: "Thorough & detailed" },
];

const STEPS = ["Subject", "Level & goal", "Scope", "Style"];

export function CourseWizard({ hasKey }: { hasKey: boolean }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<Questionnaire>({
    subject: "",
    category: "certification",
    level: "beginner",
    goal: "",
    moduleCount: 5,
    depth: "balanced",
    focusTopics: "",
    style: "",
  });

  const set = <K extends keyof Questionnaire>(key: K, value: Questionnaire[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  if (!hasKey) {
    return (
      <div className="rounded-xl border border-border/50 bg-card p-8 text-center">
        <KeyRound className="mx-auto mb-3 h-9 w-9 text-np-orange" />
        <h2 className="text-lg font-semibold text-foreground">Connect an AI key first</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          Custom courses are generated with your own AI provider. Add and validate your key in
          Settings, then come back to create a course.
        </p>
        <Link
          href="/settings"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <KeyRound className="h-4 w-4" />
          Go to Settings
        </Link>
      </div>
    );
  }

  const handleGenerate = () => {
    setError("");
    setGenerating(true);
    generateCourse(form).then((res) => {
      if (res.ok) {
        router.push(`/courses/${res.slug}`);
      } else if (res.error === "no-key") {
        setGenerating(false);
        setError("Your AI key is missing. Add it in Settings.");
      } else {
        setGenerating(false);
        setError(res.error);
      }
    });
  };

  if (generating) {
    return (
      <div className="rounded-2xl border border-border/40 bg-card p-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-7 w-7 animate-pulse text-primary" />
        </div>
        <h2 className="flex items-center justify-center gap-2 text-lg font-semibold text-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Designing your course…
        </h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          Building the module and lesson structure for <b>{form.subject}</b>. This takes about
          10–30 seconds. Lesson content is written on demand as you open each lesson.
        </p>
      </div>
    );
  }

  const canNext = step !== 0 || form.subject.trim().length > 0;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                i < step && "bg-primary text-primary-foreground",
                i === step && "border-2 border-primary text-primary",
                i > step && "border border-border text-muted-foreground",
              )}
            >
              {i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("h-0.5 flex-1 rounded", i < step ? "bg-primary" : "bg-border")} />
            )}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border/40 bg-card p-6">
        {/* Step 0: subject */}
        {step === 0 && (
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                What do you want to learn?
              </label>
              <input
                autoFocus
                value={form.subject}
                onChange={(e) => set("subject", e.target.value)}
                placeholder="e.g. AWS Solutions Architect (SAA-C03), GATE CS — Operating Systems"
                className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Type</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => set("category", c.value)}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-sm transition-all",
                      form.category === c.value
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border/60 text-muted-foreground hover:border-primary/40",
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: level & goal */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Your level</label>
              <div className="grid grid-cols-2 gap-2">
                {LEVELS.map((l) => (
                  <button
                    key={l.value}
                    onClick={() => set("level", l.value)}
                    className={cn(
                      "rounded-lg border px-3 py-2.5 text-left transition-all",
                      form.level === l.value
                        ? "border-primary bg-primary/10"
                        : "border-border/60 hover:border-primary/40",
                    )}
                  >
                    <p className="text-sm font-medium text-foreground">{l.label}</p>
                    <p className="text-xs text-muted-foreground">{l.hint}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Goal <span className="text-muted-foreground">(optional)</span>
              </label>
              <input
                value={form.goal}
                onChange={(e) => set("goal", e.target.value)}
                placeholder="e.g. pass the exam in 6 weeks, build practical skills"
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        )}

        {/* Step 2: scope */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="flex items-center justify-between text-sm font-medium text-foreground">
                <span>Number of modules</span>
                <span className="text-primary">{form.moduleCount}</span>
              </label>
              <div className="py-2">
                <Slider
                  min={2}
                  max={8}
                  step={1}
                  value={form.moduleCount}
                  onValueChange={(value) =>
                    set("moduleCount", Array.isArray(value) ? value[0] : value)
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground">
                More modules = broader coverage (and more of your AI credits used).
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Lesson depth</label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {DEPTHS.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => set("depth", d.value)}
                    className={cn(
                      "rounded-lg border px-3 py-2.5 text-left transition-all",
                      form.depth === d.value
                        ? "border-primary bg-primary/10"
                        : "border-border/60 hover:border-primary/40",
                    )}
                  >
                    <p className="text-sm font-medium text-foreground">{d.label}</p>
                    <p className="text-xs text-muted-foreground">{d.hint}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: style + focus */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Focus topics <span className="text-muted-foreground">(optional)</span>
              </label>
              <input
                value={form.focusTopics}
                onChange={(e) => set("focusTopics", e.target.value)}
                placeholder="e.g. VPC networking, IAM, S3 — emphasize these"
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Style <span className="text-muted-foreground">(optional)</span>
              </label>
              <input
                value={form.style}
                onChange={(e) => set("style", e.target.value)}
                placeholder="e.g. practical with lots of examples, include CLI commands"
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="rounded-lg border border-border/40 bg-secondary/40 p-3 text-sm text-muted-foreground">
              Generating <b className="text-foreground">{form.subject || "your course"}</b> ·{" "}
              {form.moduleCount} modules · {form.level} · {form.depth}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        {isLast ? (
          <button
            onClick={handleGenerate}
            disabled={!form.subject.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            Generate course
          </button>
        ) : (
          <button
            onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
            disabled={!canNext}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
