"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Bug, Lightbulb, MessageCircle, MessageSquarePlus, Loader2, CheckCircle2, Send } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { submitFeedback } from "@/lib/actions/feedback";

type FeedbackType = "bug" | "idea" | "other";

const TYPES: { value: FeedbackType; label: string; icon: typeof Bug }[] = [
  { value: "bug", label: "Bug", icon: Bug },
  { value: "idea", label: "Idea", icon: Lightbulb },
  { value: "other", label: "Other", icon: MessageCircle },
];

export function FeedbackWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("bug");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const reset = () => {
    setType("bug");
    setMessage("");
    setStatus("idle");
    setError("");
  };

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setTimeout(reset, 200); // reset after the close animation
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 3) {
      setError("Please write a little more.");
      return;
    }
    setStatus("sending");
    setError("");
    try {
      const res = await submitFeedback({ type, message: message.trim(), url: pathname });
      if (res.ok) {
        setStatus("sent");
      } else {
        setStatus("error");
        setError(res.error);
      }
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      {/* Floating trigger — sits above the mobile bottom-nav, bottom-right on desktop. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Send feedback"
        className="fixed bottom-20 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-105 active:scale-95 md:bottom-6 md:right-6"
      >
        <MessageSquarePlus className="h-5 w-5" />
      </button>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          {status === "sent" ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 className="h-10 w-10 text-primary" />
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Thanks for the feedback!</p>
                <p className="text-sm text-muted-foreground">
                  It goes straight to the team. We read every message.
                </p>
              </div>
              <Button variant="outline" onClick={() => onOpenChange(false)} className="mt-2">
                Done
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Send feedback</DialogTitle>
                <DialogDescription>
                  Found a bug or have an idea? Tell us — it helps make LazyPrep better.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Type selector */}
                <div className="grid grid-cols-3 gap-2">
                  {TYPES.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setType(value)}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-lg border px-2 py-3 text-xs font-medium transition-colors",
                        type === value
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border text-muted-foreground hover:bg-muted",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  maxLength={2000}
                  autoFocus
                  placeholder={
                    type === "bug"
                      ? "What happened? What did you expect instead?"
                      : type === "idea"
                        ? "What would make LazyPrep better?"
                        : "What's on your mind?"
                  }
                  className="w-full resize-none rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <Button type="submit" size="lg" disabled={status === "sending"} className="w-full">
                  {status === "sending" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Send feedback
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
