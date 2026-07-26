"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { toggleBookmark, type BookmarkTargetType } from "@/lib/actions/bookmarks";
import { cn } from "@/lib/utils";

export function BookmarkButton({
  targetType,
  targetId,
  initialBookmarked = false,
  className,
}: {
  targetType: BookmarkTargetType;
  targetId: string;
  initialBookmarked?: boolean;
  className?: string;
}) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const nextState = !bookmarked;
    setBookmarked(nextState);

    startTransition(async () => {
      const res = await toggleBookmark(targetType, targetId);
      if (res.ok) {
        setBookmarked(res.isBookmarked);
      } else {
        setBookmarked(!nextState); // Rollback on error
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      title={bookmarked ? "Remove bookmark" : "Save bookmark"}
      aria-label={bookmarked ? "Remove bookmark" : "Save bookmark"}
      aria-pressed={bookmarked}
      className={cn(
        "inline-flex items-center justify-center rounded-control p-2 transition-colors hover:bg-foreground/10 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        bookmarked ? "text-streak-warm" : "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      <Bookmark className={cn("h-5 w-5", bookmarked && "fill-streak-warm")} />
    </button>
  );
}
