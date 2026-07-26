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
      loadingVariant="console"
      loadingSequences={[
        {
          status: "Reading the course",
          lines: [
            "Loading modules and lessons…",
            "Identifying testable objectives…",
            "Mapping topics to question types…",
            "Balancing coverage across modules…",
          ],
        },
        {
          status: "Writing questions",
          lines: [
            "Drafting question stems…",
            "Building plausible distractors…",
            "Checking exactly one answer is correct…",
            "Writing explanations for each option…",
          ],
        },
        {
          status: "Calibrating difficulty",
          lines: [
            "Scoring each question…",
            "Spreading easy, medium and hard…",
            "Tagging questions by topic…",
            "Almost ready…",
          ],
        },
      ]}
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
