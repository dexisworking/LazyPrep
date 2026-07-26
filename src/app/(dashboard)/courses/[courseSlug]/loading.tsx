import { Skeleton } from "@/components/ui/skeleton";

export default function CourseDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="rounded-card border border-border-subtle bg-card p-6 md:p-8">
        <Skeleton className="h-5 w-28 rounded-full" />
        <Skeleton className="mt-4 h-8 w-64" />
        <Skeleton className="mt-2 h-4 w-full max-w-lg" />
        <div className="mt-5 flex items-center gap-3">
          <Skeleton className="h-2 w-48 rounded-full" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="mt-5 h-10 w-44 rounded-control" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-card border border-border-subtle bg-card p-5">
          <Skeleton className="h-5 w-52" />
          <div className="mt-4 space-y-2.5">
            <Skeleton className="h-10 w-full rounded-control" />
            <Skeleton className="h-10 w-full rounded-control" />
            <Skeleton className="h-10 w-full rounded-control" />
          </div>
        </div>
      ))}
    </div>
  );
}
