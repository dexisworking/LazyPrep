import { Skeleton } from "@/components/ui/skeleton";

export default function PracticeLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/40 bg-card p-5">
            <Skeleton className="h-6 w-40" />
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
            <Skeleton className="mt-5 h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
