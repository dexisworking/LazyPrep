"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LessonContent } from "@/components/lesson/lesson-content";
import { TextSelectionToolbar } from "@/components/lesson/text-selection-toolbar";
import { NotepadPanel } from "@/components/notepad/notepad-panel";
import { TutorPanel } from "@/components/tutor/tutor-panel";
import { addNotepadEntry } from "@/lib/actions/notepad";
import { generateInDepthSection } from "@/lib/actions/in-depth";

/**
 * Client component that wraps all interactive lesson elements and coordinates
 * state between text selection → tutor panel, notepad panel, and in-depth
 * generation. The parent lesson page (server component) passes data down;
 * this component owns all the client-side interactivity.
 */
export function LessonInteractiveWrapper({
  content,
  courseId,
  lessonId,
  lessonTitle,
  moduleId,
  moduleTitle,
  modules,
}: {
  content: string;
  courseId: string;
  lessonId: string;
  lessonTitle: string;
  moduleId: string;
  moduleTitle: string;
  modules?: { id: string; title: string }[];
}) {
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);

  // ─── Tutor integration ───
  const [pendingTutorPrompt, setPendingTutorPrompt] = useState<string | null>(null);

  // ─── In-depth generation ───
  const [inDepthLoading, setInDepthLoading] = useState(false);
  const [inDepthError, setInDepthError] = useState("");

  // ─── Selection toolbar actions ───
  const handleSelectionAction = useCallback(
    async (action: "ask-tutor" | "add-notepad" | "learn-in-depth", selectedText: string) => {
      switch (action) {
        case "ask-tutor":
          // Set the pending prompt — the TutorPanel will pick it up and open
          setPendingTutorPrompt(`Explain this: "${selectedText}"`);
          break;

        case "add-notepad":
          // Dispatch a custom event that the NotepadPanel listens for
          window.dispatchEvent(
            new CustomEvent("notepad:add", {
              detail: { text: selectedText, sourceType: "highlight" as const },
            }),
          );
          // Also call the server action directly as a fallback
          await addNotepadEntry({
            courseId,
            content: selectedText,
            sourceType: "highlight",
            moduleId,
            moduleTitle,
            lessonId,
            lessonTitle,
          });
          break;

        case "learn-in-depth":
          setInDepthLoading(true);
          setInDepthError("");
          const res = await generateInDepthSection(lessonId, selectedText);
          setInDepthLoading(false);
          if (res.ok) {
            // Refresh the page to show the appended deep-dive section
            router.refresh();
          } else {
            setInDepthError(res.error);
          }
          break;
      }
    },
    [courseId, lessonId, lessonTitle, moduleId, moduleTitle, router],
  );

  return (
    <>
      {/* Lesson content with text selection toolbar */}
      <div ref={contentRef} className="relative">
        <LessonContent content={content} />
        <TextSelectionToolbar
          containerRef={contentRef}
          onAction={handleSelectionAction}
          inDepthLoading={inDepthLoading}
        />
      </div>

      {/* In-depth generation error */}
      {inDepthError && (
        <p className="mt-2 text-sm text-destructive">{inDepthError}</p>
      )}

      {/* In-depth loading indicator */}
      {inDepthLoading && (
        <div className="mt-4 flex items-center gap-2 rounded-card border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Generating deep-dive section…
        </div>
      )}

      {/* Notepad panel */}
      <NotepadPanel
        courseId={courseId}
        moduleId={moduleId}
        moduleTitle={moduleTitle}
        lessonId={lessonId}
        lessonTitle={lessonTitle}
        modules={modules}
      />

      {/* Tutor panel with external prompt injection */}
      <TutorPanel
        courseId={courseId}
        lessonId={lessonId}
        pendingPrompt={pendingTutorPrompt}
        onPromptConsumed={() => setPendingTutorPrompt(null)}
      />
    </>
  );
}
