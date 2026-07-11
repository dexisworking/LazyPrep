/**
 * Shared, framework-agnostic validation for interactive lesson blocks.
 *
 * Interactive blocks are fenced code blocks whose language tag names a widget
 * (quiz / sort / match / flip / diagram / callout / term); the body is JSON
 * (except `term`, which is plain text). This module is the SINGLE SOURCE OF
 * TRUTH for which languages are interactive and what payload each requires.
 *
 * It contains no JSX and no client-only code, so both the client renderer
 * (`src/components/lesson/blocks/index.tsx`) and the server-side AI generator
 * (`src/lib/ai/generate.ts`) import from here. Keeping them in lockstep means
 * a block the generator considers valid is exactly one the renderer will draw.
 *
 * Syntax reference for authors: content/README.md.
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

/** True if `lang` names an interactive block widget. */
export function isInteractiveLang(lang: string): boolean {
  return INTERACTIVE_LANGS.has(lang);
}

/**
 * Structural validation of a single block's raw body. Mirrors exactly the
 * guards in `renderLessonBlock` — if this returns true, the renderer will draw
 * the widget; if false, the renderer falls back to a plain code block.
 *
 * `term` is always valid (plain text). Everything else must be well-formed JSON
 * of the expected shape.
 */
export function validateBlock(lang: string, raw: string): boolean {
  if (lang === "term") return true;
  if (!INTERACTIVE_LANGS.has(lang)) return false;

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return false;
  }
  if (typeof data !== "object" || data === null) return false;
  const d = data as Record<string, unknown>;

  switch (lang) {
    case "quiz":
      if (!Array.isArray(d.options) || d.options.length < 2) return false;
      if (typeof d.answer !== "number" || d.answer < 0 || d.answer >= d.options.length) return false;
      if (typeof d.question !== "string") return false;
      return true;
    case "sort":
      return Array.isArray(d.items) && d.items.length >= 2;
    case "match":
      return (
        Array.isArray(d.pairs) &&
        d.pairs.length >= 2 &&
        d.pairs.every(
          (p: unknown) =>
            typeof p === "object" &&
            p !== null &&
            typeof (p as { left?: unknown }).left === "string" &&
            typeof (p as { right?: unknown }).right === "string",
        )
      );
    case "flip":
      return Array.isArray(d.cards) && d.cards.length > 0;
    case "diagram":
      if (d.type === "layers") return Array.isArray(d.layers) && d.layers.length > 0;
      if (d.type === "flow") return Array.isArray(d.steps) && d.steps.length > 0;
      if (d.type === "compare") return Boolean(d.left) && Boolean(d.right);
      return false;
    case "callout":
      return typeof d.body === "string" && d.body.length > 0;
    default:
      return false;
  }
}
