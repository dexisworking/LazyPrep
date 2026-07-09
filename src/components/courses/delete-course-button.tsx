"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { deleteCourse } from "@/lib/actions/course";

export function DeleteCourseButton({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    setError("");
    startTransition(async () => {
      const res = await deleteCourse(courseId);
      if (res.ok) {
        router.push("/courses");
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  };

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
      >
        <Trash2 className="h-4 w-4" />
        Delete course
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-destructive/40 bg-destructive/5 p-4">
      <p className="flex items-start gap-2 text-sm text-foreground">
        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
        Delete this course permanently? All its lessons, checkpoints and your progress will be
        removed. This can&apos;t be undone.
      </p>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Delete permanently
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
