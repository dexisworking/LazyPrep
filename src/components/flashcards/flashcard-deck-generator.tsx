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
