"use client";

import { Sparkles } from "lucide-react";

import { GeneratorPanel } from "@/components/shared/generator-panel";
import { generateLessonContent } from "@/lib/actions/generate";

/**
 * Renders when an AI-generated lesson has no content yet. Triggers generation
 * on mount, shows progress, then refreshes to reveal the lesson.
 */
export function LessonGenerator({ lessonId }: { lessonId: string }) {
  return (
    <GeneratorPanel
      run={() => generateLessonContent(lessonId)}
      icon={Sparkles}
      tone="primary"
      loadingTexts={[
        "Reading the syllabus…",
        "Outlining this lesson…",
        "Writing the explanation…",
        "Adding diagrams and examples…",
        "Almost there…",
      ]}
      labels={{
        loading: "Writing this lesson with your AI…",
        loadingHint:
          "This usually takes 10–30 seconds. It's saved after, so it only generates once.",
        errorTitle: "Couldn't generate this lesson",
        noKeyTitle: "Add your AI API key to generate this lesson",
        noKeyHint: "This course generates content with your own AI key.",
      }}
    />
  );
}
