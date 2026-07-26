import { Skeleton } from "@/components/ui/skeleton";
import { StatGridSkeleton } from "@/components/shared/skeletons";

/** Mirrors dashboard/page.tsx: hero → streak card → 3 stats → continue → today/actions. */
export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Welcome hero */}
      <div className="rounded-card border border-border-subtle bg-card p-6 md:p-8">
        <div className="space-y-4">
          <Skeleton className="h-6 w-36 rounded-full" />
          <Skeleton className="h-8 w-72 max-w-full" />
          <div className="max-w-md space-y-1.5">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        </div>
      </div>

      {/* Streak card — the real page renders one here; omitting it was a ~140px jump. */}
      <div className="rounded-card border border-border-subtle bg-card p-card">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-control" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-5 w-28 rounded-full" />
        </div>
        <div className="mt-4 space-y-1.5">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
        <div className="mt-4 flex justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>

      {/* 3 stat cards, matching the real grid */}
      <StatGridSkeleton count={3} />

      {/* Continue learning */}
      <div className="rounded-card border border-border-subtle bg-card p-6">
        <div className="space-y-3">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-6 w-56 max-w-full" />
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-1.5 w-40 rounded-full" />
        </div>
      </div>

      {/* Today + quick actions */}
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-card border border-border-subtle bg-card p-card">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-control" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
