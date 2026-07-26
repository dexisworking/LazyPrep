"use client";

import { Sparkles } from "lucide-react";

import { GeneratorPanel } from "@/components/shared/generator-panel";
import { ensurePracticeBank } from "@/lib/actions/ai-content";

/**
 * Shown on an AI course's Practice tab when it has no question bank yet.
 * Auto-generates a starter set on mount (once), then refreshes to reveal it.
 */
export function PracticeBankGenerator({ courseId }: { courseId: string }) {
  return (
    <GeneratorPanel
      run={() => ensurePracticeBank(courseId)}
      icon={Sparkles}
      tone="primary"
      labels={{
        loading: "Building your practice questions with AI…",
        loadingHint: "This runs once for this course and takes about 10–30 seconds.",
        errorTitle: "Couldn't build the practice set",
        noKeyTitle: "Add your AI API key to build a practice set",
        noKeyHint: "Practice questions for this course are generated with your own AI key.",
      }}
    />
  );
}
