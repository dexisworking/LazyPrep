"use client";

import { useState, useTransition } from "react";
import { Share2, Link, Link2Off, Check, Copy } from "lucide-react";
import { toggleCourseShare } from "@/lib/actions/course";
import { cn } from "@/lib/utils";

interface ShareCourseButtonProps {
  courseId: string;
  initialIsShared: boolean;
  initialShareCode: string | null;
}

export function ShareCourseButton({
  courseId,
  initialIsShared,
  initialShareCode,
}: ShareCourseButtonProps) {
  const [isShared, setIsShared] = useState(initialIsShared);
  const [shareCode, setShareCode] = useState(initialShareCode);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const shareUrl =
    shareCode && typeof window !== "undefined"
      ? `${window.location.origin}/share/${shareCode}`
      : null;

  const handleToggle = () => {
    startTransition(async () => {
      const res = await toggleCourseShare(courseId);
      if (res.ok) {
        setIsShared(res.isShared);
        if (res.shareCode) setShareCode(res.shareCode);
      }
    });
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that don't support clipboard API
      const textarea = document.createElement("textarea");
      textarea.value = shareUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={cn(
          "inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
          isShared
            ? "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
            : "border-border bg-card text-foreground hover:bg-muted",
          isPending && "opacity-60 cursor-not-allowed",
        )}
      >
        {isShared ? (
          <>
            <Link2Off className="h-4 w-4" />
            Disable Sharing
          </>
        ) : (
          <>
            <Share2 className="h-4 w-4" />
            Share Course
          </>
        )}
      </button>

      {isShared && shareUrl && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <Link className="h-4 w-4 flex-shrink-0 text-primary" />
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 bg-transparent text-xs font-medium text-foreground focus:outline-none"
          />
          <button
            onClick={handleCopy}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
              copied
                ? "bg-np-success/10 text-np-success"
                : "bg-primary/10 text-primary hover:bg-primary/20",
            )}
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
