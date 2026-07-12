"use client";

import { isValidElement, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { INTERACTIVE_LANGS, renderLessonBlock } from "@/components/lesson/blocks";

/** Collect the plain text inside a rendered <code> element (spans included). */
function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement(node)) return textOf((node.props as { children?: ReactNode }).children);
  return "";
}

/**
 * Fenced code blocks arrive as <pre><code class="language-…">. When the
 * language names an interactive block (quiz / sort / match / flip / diagram /
 * callout / term) we swap the whole <pre> for the interactive component;
 * malformed payloads fall back to the plain code block.
 */
function PreBlock(props: React.HTMLAttributes<HTMLPreElement>) {
  const { children, ...rest } = props;
  const child = Array.isArray(children) ? children[0] : children;

  if (isValidElement(child)) {
    const childProps = child.props as { className?: string; children?: ReactNode };
    const lang = /language-([\w-]+)/.exec(childProps.className ?? "")?.[1];
    if (lang && INTERACTIVE_LANGS.has(lang)) {
      const rendered = renderLessonBlock(lang, textOf(childProps.children));
      if (rendered !== null) return <>{rendered}</>;
    }
  }

  return <pre {...rest}>{children}</pre>;
}

/**
 * Renders lesson Markdown (GFM tables/lists + fenced-code syntax highlighting)
 * plus LazyPrep's interactive lesson blocks. Server-rendered — static styling
 * lives in the `.md-content` block in globals.css.
 */
export function LessonContent({ content }: { content: string }) {
  // SECURITY: `content` is AI-generated Markdown. react-markdown escapes raw
  // HTML by default, so injected <script>/<img onerror> etc. never execute.
  // Do NOT add `rehype-raw` (or otherwise enable raw HTML) here — it would make
  // untrusted model output an XSS vector.
  return (
    <div className="md-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { plainText: [...INTERACTIVE_LANGS] }]]}
        components={{ pre: PreBlock }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
