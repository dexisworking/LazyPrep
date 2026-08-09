"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SPRING } from "@/lib/motion";
import {
  StickyNote,
  X,
  Loader2,
  Trash2,
  Pencil,
  Check,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getNotepad,
  addNotepadEntry,
  updateNotepadEntry,
  deleteNotepadEntry,
  clearNotepad,
  type NotepadEntryData,
} from "@/lib/actions/notepad";

// ─── Relative time ───

function timeAgo(date: Date): string {
  const ms = Date.now() - new Date(date).getTime();
  const mins = Math.floor(ms / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const SOURCE_LABELS: Record<string, string> = {
  highlight: "Highlight",
  manual: "Note",
  drag: "Dragged",
};

// ─── Entry card ───

function NotepadEntryCard({
  entry,
  onUpdate,
  onDelete,
}: {
  entry: NotepadEntryData;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(entry.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing) {
      textareaRef.current?.focus();
      textareaRef.current?.select();
    }
  }, [editing]);

  const save = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== entry.content) {
      onUpdate(entry.id, trimmed);
    }
    setEditing(false);
  };

  return (
    <div className="group rounded-lg border border-border-subtle bg-background p-3 transition-colors hover:border-primary/20">
      {editing ? (
        <div className="space-y-2">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) save();
              if (e.key === "Escape") {
                setDraft(entry.content);
                setEditing(false);
              }
            }}
            rows={3}
            className="w-full resize-none rounded-control border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          />
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => {
                setDraft(entry.content);
                setEditing(false);
              }}
              className="rounded-control px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={save}
              className="inline-flex items-center gap-1 rounded-control bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground transition-colors hover:opacity-90"
            >
              <Check className="h-3 w-3" />
              Save
            </button>
          </div>
        </div>
      ) : (
        <>
          <p
            className="cursor-text whitespace-pre-wrap text-sm leading-relaxed text-foreground"
            onClick={() => setEditing(true)}
          >
            {entry.content}
          </p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-3xs text-muted-foreground">
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 font-medium",
                  entry.sourceType === "highlight"
                    ? "bg-np-orange/10 text-np-orange"
                    : entry.sourceType === "drag"
                      ? "bg-primary/10 text-primary"
                      : "bg-secondary text-muted-foreground",
                )}
              >
                {SOURCE_LABELS[entry.sourceType] ?? entry.sourceType}
              </span>
              {entry.lessonTitle && (
                <span className="truncate" title={entry.lessonTitle}>
                  from {entry.lessonTitle}
                </span>
              )}
              <span>{timeAgo(entry.createdAt)}</span>
            </div>
            <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => setEditing(true)}
                className="rounded-control p-1 text-muted-foreground transition-colors hover:text-foreground"
                title="Edit"
              >
                <Pencil className="h-3 w-3" />
              </button>
              <button
                onClick={() => onDelete(entry.id)}
                className="rounded-control p-1 text-muted-foreground transition-colors hover:text-destructive"
                title="Delete"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main panel ───

export function NotepadPanel({
  courseId,
  moduleId,
  moduleTitle,
  lessonId,
  lessonTitle,
  modules,
}: {
  courseId: string;
  moduleId?: string;
  moduleTitle?: string;
  lessonId?: string;
  lessonTitle?: string;
  modules?: { id: string; title: string }[];
}) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<NotepadEntryData[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState<string | null>(null); // null = "All"
  const [adding, setAdding] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  // Build module tabs from entries + passed modules list
  const moduleTabs = (() => {
    const map = new Map<string, string>();
    modules?.forEach((m) => map.set(m.id, m.title));
    entries.forEach((e) => {
      if (e.moduleId && e.moduleTitle) map.set(e.moduleId, e.moduleTitle);
    });
    return [...map.entries()].map(([id, title]) => ({ id, title }));
  })();

  const filteredEntries = activeTab
    ? entries.filter((e) => e.moduleId === activeTab)
    : entries;

  // Load notepad on first open
  useEffect(() => {
    if (!open || initialized.current) return;
    initialized.current = true;
    setLoading(true);
    getNotepad(courseId).then((res) => {
      setLoading(false);
      if (res.ok) setEntries(res.notepad.entries);
    });
  }, [open, courseId]);

  // Scroll to top when new entries are added
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [entries.length]);

  // Escape key closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // ─── Actions ───

  const handleAdd = useCallback(
    async (text: string, sourceType: "manual" | "highlight" | "drag" = "manual") => {
      const trimmed = text.trim();
      if (!trimmed || adding) return;
      setAdding(true);
      const res = await addNotepadEntry({
        courseId,
        content: trimmed,
        sourceType,
        moduleId,
        moduleTitle,
        lessonId,
        lessonTitle,
      });
      setAdding(false);
      if (res.ok) {
        setEntries((prev) => [res.entry, ...prev]);
        setInput("");
      }
    },
    [courseId, moduleId, moduleTitle, lessonId, lessonTitle, adding],
  );

  const handleUpdate = useCallback(async (id: string, content: string) => {
    const res = await updateNotepadEntry(id, content);
    if (res.ok) {
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, content } : e)),
      );
    }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    const res = await deleteNotepadEntry(id);
    if (res.ok) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
    }
  }, []);

  const handleClear = useCallback(async () => {
    const res = await clearNotepad(courseId);
    if (res.ok) setEntries([]);
  }, [courseId]);

  // ─── Drop handling ───

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const text = e.dataTransfer.getData("text/plain");
      if (text.trim()) {
        void handleAdd(text, "drag");
      }
    },
    [handleAdd],
  );

  // ─── External API for adding entries from text selection ───

  // Attach to window so the text selection toolbar can call it
  useEffect(() => {
    const handler = (e: CustomEvent<{ text: string; sourceType: "highlight" | "drag" }>) => {
      setOpen(true);
      void handleAdd(e.detail.text, e.detail.sourceType);
    };
    window.addEventListener("notepad:add" as string, handler as EventListener);
    return () =>
      window.removeEventListener("notepad:add" as string, handler as EventListener);
  }, [handleAdd]);

  return (
    <>
      {/* Trigger FAB — bottom-left, opposite the tutor FAB */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] left-4 z-40 inline-flex items-center gap-2 rounded-full bg-card border border-border-subtle px-4 py-3 text-sm font-semibold text-foreground shadow-fab transition-[background-color,transform] duration-(--dur-fast) hover:bg-secondary active:scale-95 md:bottom-6 md:left-6"
      >
        <StickyNote className="h-4 w-4 text-np-orange" />
        Notepad
        {entries.length > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-3xs font-bold text-primary-foreground">
            {entries.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop (mobile) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:bg-transparent md:backdrop-blur-none"
            />
            <motion.div
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
              transition={SPRING.snappy}
              role="dialog"
              aria-label="Course notepad"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="fixed inset-x-0 bottom-0 z-50 flex h-[80dvh] flex-col rounded-t-card border border-border-subtle bg-card shadow-overlay md:inset-x-auto md:bottom-6 md:left-6 md:h-[32rem] md:w-[26rem] md:rounded-card"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-np-orange/15">
                    <StickyNote className="h-4 w-4 text-np-orange" />
                  </span>
                  <span className="text-sm font-semibold text-foreground">Course Notepad</span>
                </div>
                <div className="flex items-center gap-1">
                  {entries.length > 0 && (
                    <button
                      onClick={handleClear}
                      className="rounded-control px-2 py-1 text-3xs text-muted-foreground transition-colors hover:text-destructive"
                      title="Clear all entries"
                    >
                      Clear all
                    </button>
                  )}
                  <button
                    onClick={() => setOpen(false)}
                    aria-label="Close notepad"
                    className="rounded-control p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Module tabs */}
              {moduleTabs.length > 1 && (
                <div className="flex items-center gap-1 overflow-x-auto border-b border-border-subtle px-4 py-2 scrollbar-none">
                  <button
                    onClick={() => setActiveTab(null)}
                    className={cn(
                      "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                      activeTab === null
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground",
                    )}
                  >
                    All
                  </button>
                  {moduleTabs.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setActiveTab(m.id)}
                      className={cn(
                        "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                        activeTab === m.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {m.title}
                    </button>
                  ))}
                </div>
              )}

              {/* Body */}
              <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredEntries.length === 0 ? (
                  <div className="rounded-card border border-border-subtle bg-secondary/40 p-4 text-center text-sm text-muted-foreground">
                    {activeTab
                      ? "No notes in this module yet."
                      : "Your notepad is empty. Select text in lessons to highlight, or type notes below."}
                  </div>
                ) : (
                  filteredEntries.map((entry) => (
                    <NotepadEntryCard
                      key={entry.id}
                      entry={entry}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </div>

              {/* Compose area */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleAdd(input, "manual");
                }}
                className="flex items-center gap-2 border-t border-border-subtle p-3"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Add a note…"
                  className="h-10 flex-1 rounded-control border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                />
                <button
                  type="submit"
                  disabled={adding || !input.trim()}
                  className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-control bg-np-orange text-white transition-[background-color,border-color,color,box-shadow,opacity,transform] hover:opacity-90 disabled:opacity-40"
                >
                  {adding ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
