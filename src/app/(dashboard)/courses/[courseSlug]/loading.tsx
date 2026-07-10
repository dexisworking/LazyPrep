import { Skeleton } from "@/components/ui/skeleton";

export default function CourseDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/40 bg-card p-6 md:p-8">
        <Skeleton className="h-5 w-28 rounded-full" />
        <Skeleton className="mt-4 h-8 w-64" />
        <Skeleton className="mt-2 h-4 w-full max-w-lg" />
        <div className="mt-5 flex items-center gap-3">
          <Skeleton className="h-2 w-48 rounded-full" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="mt-5 h-10 w-44 rounded-lg" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border/50 bg-card p-5">
          <Skeleton className="h-5 w-52" />
          <div className="mt-4 space-y-2.5">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
