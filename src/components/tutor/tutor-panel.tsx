"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Sparkles,
  Send,
  X,
  Loader2,
  KeyRound,
  GraduationCap,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { askTutor, type TutorTurn } from "@/lib/actions/tutor";

const QUICK_ACTIONS = ["Explain this more simply", "Give me another example", "Quiz me on this"];

/**
 * In-context AI tutor: a launcher (floating FAB on lessons, or an inline button
 * elsewhere) that opens a chat dock grounded in the current lesson/question via
 * the askTutor server action. Stateless server-side — this component owns the
 * thread. Reuses the BYO-key model.
 */
export function TutorPanel({
  courseId,
  lessonId,
  questionId,
  seedPrompt,
  trigger = "floating",
  label = "Ask the tutor",
}: {
  courseId: string;
  lessonId?: string;
  questionId?: string;
  seedPrompt?: string;
  trigger?: "floating" | "inline";
  label?: string;
}) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<TutorTurn[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [noKey, setNoKey] = useState(false);
  const [error, setError] = useState("");
  const seeded = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;
    setError("");
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    const res = await askTutor({ courseId, lessonId, questionId, messages: next });
    setLoading(false);
    if (res.ok) {
      setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
    } else if (res.error === "no-key") {
      setNoKey(true);
    } else {
      setError(res.error);
    }
  };

  // Auto-send the seed prompt the first time the panel opens.
  useEffect(() => {
    if (open && seedPrompt && !seeded.current) {
      seeded.current = true;
      void send(seedPrompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Keep the thread scrolled to the latest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  return (
    <>
      {trigger === "floating" ? (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-20 right-4 z-30 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:opacity-90 active:scale-95 md:bottom-6 md:right-6"
        >
          <Sparkles className="h-4 w-4" />
          {label}
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          {label}
        </button>
      )}

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop (mobile) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 md:bg-transparent"
            />
            <motion.div
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              className="fixed inset-x-0 bottom-0 z-50 flex h-[80vh] flex-col rounded-t-2xl border border-border/60 bg-card shadow-2xl md:inset-x-auto md:bottom-6 md:right-6 md:h-[32rem] md:w-[26rem] md:rounded-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15">
                    <GraduationCap className="h-4 w-4 text-primary" />
                  </span>
                  <span className="text-sm font-semibold text-foreground">AI Tutor</span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close tutor"
                  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              {noKey ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
                  <KeyRound className="h-8 w-8 text-np-orange" />
                  <p className="font-medium text-foreground">Add your AI key to use the tutor</p>
                  <p className="text-sm text-muted-foreground">
                    The tutor runs on your own AI provider key.
                  </p>
                  <Link
                    href="/settings"
                    className="mt-1 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                  >
                    Go to Settings
                  </Link>
                </div>
              ) : (
                <>
                  <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                    {messages.length === 0 && !loading && (
                      <div className="rounded-xl border border-border/50 bg-secondary/40 p-4 text-sm text-muted-foreground">
                        Ask me anything about this {questionId ? "question" : "lesson"} — for a
                        simpler explanation, another example, or a quick quiz.
                      </div>
                    )}
                    {messages.map((m, i) => (
                      <div
                        key={i}
                        className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
                      >
                        <div
                          className={cn(
                            "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm",
                            m.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "border border-border/50 bg-background text-foreground",
                          )}
                        >
                          {m.role === "assistant" ? (
                            <div className="tutor-md space-y-2 leading-relaxed">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                            </div>
                          ) : (
                            m.content
                          )}
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="inline-flex items-center gap-2 rounded-2xl border border-border/50 bg-background px-3.5 py-2.5 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Thinking…
                        </div>
                      </div>
                    )}
                    {error && <p className="text-sm text-destructive">{error}</p>}
                  </div>

                  {/* Quick actions */}
                  {messages.length > 0 && !loading && (
                    <div className="flex flex-wrap gap-1.5 px-4 pb-2">
                      {QUICK_ACTIONS.map((q) => (
                        <button
                          key={q}
                          onClick={() => send(q)}
                          className="rounded-full border border-border/60 bg-background px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Composer */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void send(input);
                    }}
                    className="flex items-center gap-2 border-t border-border/50 p-3"
                  >
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask the tutor…"
                      className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      type="submit"
                      disabled={loading || !input.trim()}
                      className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all hover:opacity-90 disabled:opacity-40"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
