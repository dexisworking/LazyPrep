import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Welcome hero */}
      <div className="rounded-2xl border border-border/40 bg-card p-6 md:p-8">
        <div className="space-y-4">
          <Skeleton className="h-6 w-36 rounded-full" />
          <Skeleton className="h-9 w-72" />
          <div className="max-w-md space-y-1.5">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-card p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-7 w-16" />
          </div>
        ))}
      </div>

      {/* Continue learning */}
      <div className="rounded-2xl border border-border/40 bg-card p-6">
        <div className="space-y-3">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-1.5 w-40 rounded-full" />
        </div>
      </div>

      {/* Today + quick actions */}
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-card p-5">
            <Skeleton className="h-4 w-20" />
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
