import type { ReactNode } from "react";
import { QuizBlock, type QuizBlockData } from "./quiz-block";
import { SortBlock, type SortBlockData } from "./sort-block";
import { MatchBlock, type MatchBlockData } from "./match-block";
import { FlipBlock, type FlipBlockData } from "./flip-block";
import { DiagramBlock, type DiagramBlockData } from "./diagram-block";
import { CalloutBlock, type CalloutBlockData } from "./callout-block";
import { TerminalBlock } from "./terminal-block";

/**
 * Interactive lesson blocks — fenced code blocks whose language tag names a
 * block type. The body is JSON (except `term`, which is plain text). Applies
 * to EVERY lesson (curated packs and AI-generated) via LessonContent.
 * Syntax reference: content/README.md.
 */
export const INTERACTIVE_LANGS = new Set([
  "quiz",
  "sort",
  "match",
  "flip",
  "diagram",
  "callout",
  "term",
]);

/**
 * Render an interactive block from its language + raw fenced content.
 * Returns null when the payload is malformed — the caller should then fall
 * back to a plain code block so broken (e.g. AI-emitted) JSON never crashes
 * a lesson.
 */
export function renderLessonBlock(lang: string, raw: string): ReactNode | null {
  if (lang === "term") return <TerminalBlock raw={raw} />;

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof data !== "object" || data === null) return null;
  const d = data as Record<string, unknown>;

  try {
    switch (lang) {
      case "quiz":
        if (!Array.isArray(d.options) || d.options.length < 2) return null;
        if (typeof d.answer !== "number" || d.answer < 0 || d.answer >= d.options.length) return null;
        if (typeof d.question !== "string") return null;
        return <QuizBlock data={d as QuizBlockData} />;
      case "sort":
        if (!Array.isArray(d.items) || d.items.length < 2) return null;
        return <SortBlock data={d as SortBlockData} />;
      case "match":
        if (
          !Array.isArray(d.pairs) ||
          d.pairs.length < 2 ||
          !d.pairs.every(
            (p: unknown) =>
              typeof p === "object" &&
              p !== null &&
              typeof (p as { left?: unknown }).left === "string" &&
              typeof (p as { right?: unknown }).right === "string",
          )
        ) {
          return null;
        }
        return <MatchBlock data={d as MatchBlockData} />;
      case "flip":
        if (!Array.isArray(d.cards) || d.cards.length === 0) return null;
        return <FlipBlock data={d as FlipBlockData} />;
      case "diagram": {
        if (d.type === "layers" && Array.isArray(d.layers) && d.layers.length > 0)
          return <DiagramBlock data={d as DiagramBlockData} />;
        if (d.type === "flow" && Array.isArray(d.steps) && d.steps.length > 0)
          return <DiagramBlock data={d as DiagramBlockData} />;
        if (d.type === "compare" && d.left && d.right)
          return <DiagramBlock data={d as DiagramBlockData} />;
        return null;
      }
      case "callout":
        if (typeof d.body !== "string" || d.body.length === 0) return null;
        return <CalloutBlock data={d as CalloutBlockData} />;
      default:
        return null;
    }
  } catch {
    return null;
  }
}
