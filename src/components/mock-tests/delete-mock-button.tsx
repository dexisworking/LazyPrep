"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { deleteMockTest } from "@/lib/actions/ai-content";

/** Small two-tap delete for a mock test card. */
export function DeleteMockButton({ testId }: { testId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteMockTest(testId);
      if (res.ok) router.refresh();
    });
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-destructive px-2.5 py-2 text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          Delete
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="rounded-lg border border-border bg-card px-2.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Keep
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      aria-label="Delete mock test"
      className="rounded-lg border border-border/60 p-2 text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
