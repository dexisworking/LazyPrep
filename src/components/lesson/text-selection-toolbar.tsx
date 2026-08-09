"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, StickyNote, BookOpen, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ToolbarAction = "ask-tutor" | "add-notepad" | "learn-in-depth";

/**
 * Floating toolbar that appears when the user selects text inside the lesson
 * content area. Provides three contextual actions: Ask Tutor, Add to Notepad,
 * and Learn In-Depth.
 *
 * Piggybacks on the browser's native text selection — works on both desktop
 * (click-drag) and mobile (long-press → native selection handles).
 */
export function TextSelectionToolbar({
  containerRef,
  onAction,
  inDepthLoading,
}: {
  /** Ref to the container element to scope text selection within. */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Callback fired when the user picks an action. Receives the action type and selected text. */
  onAction: (action: ToolbarAction, selectedText: string) => void;
  /** When true, the Learn In-Depth button shows a spinner. */
  inDepthLoading?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);
  const ignoreNext = useRef(false);

  const updateSelection = useCallback(() => {
    if (ignoreNext.current) {
      ignoreNext.current = false;
      return;
    }

    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !containerRef.current) {
      setVisible(false);
      return;
    }

    const text = sel.toString().trim();
    if (text.length < 3) {
      setVisible(false);
      return;
    }

    // Ensure the selection is within our container
    const range = sel.getRangeAt(0);
    if (!containerRef.current.contains(range.commonAncestorContainer)) {
      setVisible(false);
      return;
    }

    setSelectedText(text);

    // Position the toolbar above the selection
    const rect = range.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    const toolbarWidth = 180; // approximate width
    const toolbarHeight = 40;
    const gap = 8;

    let top = rect.top - containerRect.top - toolbarHeight - gap;
    let left = rect.left - containerRect.left + rect.width / 2 - toolbarWidth / 2;

    // If toolbar would go above the container, show below
    if (top < 0) {
      top = rect.bottom - containerRect.top + gap;
    }

    // Clamp horizontally
    left = Math.max(0, Math.min(left, containerRect.width - toolbarWidth));

    setPosition({ top, left });
    setVisible(true);
  }, [containerRef]);

  // Listen for selection changes
  useEffect(() => {
    const onMouseUp = () => {
      // Small delay to let the selection finalize
      requestAnimationFrame(updateSelection);
    };

    const onTouchEnd = () => {
      // Longer delay for mobile selection handles
      setTimeout(updateSelection, 200);
    };

    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("mouseup", onMouseUp);
    container.addEventListener("touchend", onTouchEnd);

    // Also listen to selectionchange for keyboard-driven selection
    document.addEventListener("selectionchange", updateSelection);

    return () => {
      container.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("selectionchange", updateSelection);
    };
  }, [containerRef, updateSelection]);

  // Close when clicking outside the toolbar
  useEffect(() => {
    if (!visible) return;

    const onClick = (e: MouseEvent) => {
      if (
        toolbarRef.current &&
        !toolbarRef.current.contains(e.target as Node)
      ) {
        // Don't close if clicking within the content (might be adjusting selection)
        if (containerRef.current?.contains(e.target as Node)) return;
        setVisible(false);
      }
    };

    // Delay to avoid closing immediately after the selection click
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", onClick);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", onClick);
    };
  }, [visible, containerRef]);

  const fire = useCallback(
    (action: ToolbarAction) => {
      ignoreNext.current = true;
      onAction(action, selectedText);
      // Clear selection after action (except for learn-in-depth which may take a while)
      if (action !== "learn-in-depth") {
        window.getSelection()?.removeAllRanges();
        setVisible(false);
      }
    },
    [onAction, selectedText],
  );

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={toolbarRef}
          initial={{ opacity: 0, scale: 0.9, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 4 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={{ top: position.top, left: position.left }}
          className="absolute z-30 flex items-center gap-0.5 rounded-full border border-border-subtle bg-card px-1.5 py-1 shadow-overlay"
        >
          <button
            onClick={() => fire("ask-tutor")}
            title="Ask the tutor about this"
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Tutor</span>
          </button>

          <div className="h-4 w-px bg-border-subtle" />

          <button
            onClick={() => fire("add-notepad")}
            title="Add to notepad"
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-np-orange/10 hover:text-np-orange"
          >
            <StickyNote className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Note</span>
          </button>

          <div className="h-4 w-px bg-border-subtle" />

          <button
            onClick={() => fire("learn-in-depth")}
            disabled={inDepthLoading}
            title="Learn this in depth"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors",
              inDepthLoading
                ? "text-muted-foreground"
                : "text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400",
            )}
          >
            {inDepthLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <BookOpen className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">Depth</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
