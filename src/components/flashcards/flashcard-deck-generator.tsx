"use client";

import { Sparkles } from "lucide-react";

import { GeneratorPanel } from "@/components/shared/generator-panel";
import { ensureFlashcardDeck } from "@/lib/actions/ai-content";

/**
 * Shown on an AI course's Flashcards deck when it has no cards yet.
 * Auto-generates a starter deck on mount (once), then refreshes to reveal it.
 */
export function FlashcardDeckGenerator({ courseId }: { courseId: string }) {
  return (
    <GeneratorPanel
      run={() => ensureFlashcardDeck(courseId)}
      icon={Sparkles}
      tone="success"
      loadingVariant="console"
      loadingSequences={[
        {
          status: "Reading the course",
          lines: [
            "Loading modules and lessons…",
            "Extracting key terms and definitions…",
            "Ranking concepts by exam weight…",
            "Grouping related ideas…",
          ],
        },
        {
          status: "Writing cards",
          lines: [
            "Drafting question / answer pairs…",
            "Keeping each card to one idea…",
            "Removing near-duplicates…",
            "Tagging cards by topic…",
          ],
        },
        {
          status: "Scheduling reviews",
          lines: [
            "Seeding SM-2 intervals…",
            "Setting first due dates…",
            "Building the study queue…",
            "Almost ready…",
          ],
        },
      ]}
      labels={{
        loading: "Building your flashcard deck with AI…",
        loadingHint: "This runs once for this course and takes about 10–30 seconds.",
        errorTitle: "Couldn't build the deck",
        noKeyTitle: "Add your AI API key to build a deck",
        noKeyHint: "Flashcards for this course are generated with your own AI key.",
      }}
    />
  );
}
