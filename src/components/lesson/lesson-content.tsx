import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

/**
 * Renders lesson Markdown (GFM tables/lists + fenced-code syntax highlighting).
 * Server-rendered — styling lives in the `.md-content` block in globals.css.
 */
export function LessonContent({ content }: { content: string }) {
  return (
    <div className="md-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
