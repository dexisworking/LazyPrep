import type { ReactNode } from "react";
import { QuizBlock, type QuizBlockData } from "./quiz-block";
import { SortBlock, type SortBlockData } from "./sort-block";
import { MatchBlock, type MatchBlockData } from "./match-block";
import { FlipBlock, type FlipBlockData } from "./flip-block";
import { DiagramBlock, type DiagramBlockData } from "./diagram-block";
import { CalloutBlock, type CalloutBlockData } from "./callout-block";
import { TerminalBlock } from "./terminal-block";
import { INTERACTIVE_LANGS, validateBlock } from "@/lib/lesson-blocks";

// Re-export so existing importers (lesson-content.tsx) keep working.
export { INTERACTIVE_LANGS };

/**
 * Render an interactive block from its language + raw fenced content.
 * Returns null when the payload is malformed — the caller should then fall
 * back to a plain code block so broken (e.g. AI-emitted) JSON never crashes
 * a lesson. Validation is shared with the server generator via
 * `validateBlock` (src/lib/lesson-blocks.ts) so the two never diverge.
 */
export function renderLessonBlock(lang: string, raw: string): ReactNode | null {
  if (lang === "term") return <TerminalBlock raw={raw} />;
  if (!validateBlock(lang, raw)) return null;

  // Safe to parse — validateBlock already confirmed the shape.
  const d = JSON.parse(raw) as Record<string, unknown>;
  switch (lang) {
    case "quiz":
      return <QuizBlock data={d as QuizBlockData} />;
    case "sort":
      return <SortBlock data={d as SortBlockData} />;
    case "match":
      return <MatchBlock data={d as MatchBlockData} />;
    case "flip":
      return <FlipBlock data={d as FlipBlockData} />;
    case "diagram":
      return <DiagramBlock data={d as DiagramBlockData} />;
    case "callout":
      return <CalloutBlock data={d as CalloutBlockData} />;
    default:
      return null;
  }
}
