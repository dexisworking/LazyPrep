import { Skeleton } from "@/components/ui/skeleton";

/**
 * Mirrors dashboard/page.tsx: player card → streak + goal ring → quests →
 * continue → jump-back-in row. Radii and the 2px border match GameCard so the
 * placeholder has the same silhouette as what replaces it.
 */
function GameCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-3xl border-2 border-border-subtle bg-card p-5 shadow-[0_4px_0_0_var(--border-subtle)] ${className ?? ""}`}
    >
      <div className="flex items-center gap-4">
        <Skeleton className="h-[76px] w-[76px] rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-28 rounded-full" />
        </div>
      </div>
      <div className="mt-4 flex justify-between border-t-2 border-border-subtle pt-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Player card */}
      <div className="rounded-3xl border-2 border-border-subtle bg-card p-6 shadow-[0_4px_0_0_var(--border-subtle)] sm:p-7">
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <Skeleton className="h-[116px] w-[116px] shrink-0 rounded-full" />
          <div className="w-full flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-3.5 w-full rounded-full" />
          </div>
        </div>
      </div>

      {/* Streak + daily goal */}
      <div className="grid gap-4 lg:grid-cols-2">
        <GameCardSkeleton />
        <GameCardSkeleton />
      </div>

      {/* Quests */}
      <div className="space-y-4 rounded-3xl border-2 border-border-subtle bg-card p-5 shadow-[0_4px_0_0_var(--border-subtle)]">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
            <Skeleton className="h-4 w-10" />
          </div>
        ))}
      </div>

      {/* Continue learning */}
      <div className="rounded-3xl border-2 border-border-subtle bg-card p-5 shadow-[0_4px_0_0_var(--border-subtle)]">
        <div className="space-y-3">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-6 w-56 max-w-full" />
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-2.5 w-40 rounded-full" />
        </div>
      </div>

      {/* Jump back in */}
      <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
