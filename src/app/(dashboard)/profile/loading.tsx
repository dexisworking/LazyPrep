import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/40 bg-card p-6 md:p-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-44" />
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-5 w-64" />
          </div>
        </div>
        <Skeleton className="mt-6 h-2 w-full rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-card p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-7 w-14" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border/50 bg-card p-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-4 h-24 w-full" />
      </div>
    </div>
  );
}
