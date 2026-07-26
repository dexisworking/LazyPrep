import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Shared loading shapes.
 *
 * The seven `loading.tsx` files each hand-built their own layout and several
 * did not match the page they preceded — `/courses` showed a flat 3-column grid
 * for a page that renders a filter bar plus a 2-up and a 3-up grid, and the
 * dashboard showed four stat cards for a page with three and no streak card.
 * Every navigation therefore ended in a visible layout jump.
 *
 * Radii here track `rounded-card`, not `Skeleton`'s default `rounded-md`, so
 * the placeholder has the same silhouette as the thing replacing it.
 */

export function PageHeaderSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      <Skeleton className="h-8 w-44" />
      <Skeleton className="h-4 w-72 max-w-full" />
    </div>
  );
}

export function StatTileSkeleton() {
  return (
    <div className="rounded-card border border-border-subtle bg-card p-card">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-3 h-7 w-16" />
    </div>
  );
}

export function StatGridSkeleton({
  count = 3,
  className = "grid grid-cols-1 gap-4 sm:grid-cols-3",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <StatTileSkeleton key={i} />
      ))}
    </div>
  );
}

export function CardSkeleton({
  lines = 2,
  showProgress = false,
  showPill = false,
  className,
}: {
  lines?: number;
  showProgress?: boolean;
  showPill?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-card border border-border-subtle bg-card p-card",
        className,
      )}
    >
      {showPill && <Skeleton className="h-5 w-24 rounded-full" />}
      <Skeleton className={cn("h-6 w-40", showPill && "mt-4")} />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn("mt-2 h-4", i === lines - 1 ? "w-2/3" : "w-full")} />
      ))}
      {showProgress && (
        <div className="mt-5 space-y-2">
          <Skeleton className="h-1.5 w-full rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>
      )}
    </div>
  );
}

export function CardGridSkeleton({
  count = 6,
  className = "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
  ...card
}: { count?: number; className?: string } & Parameters<typeof CardSkeleton>[0]) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} {...card} />
      ))}
    </div>
  );
}

export function ListRowSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-card border border-border-subtle bg-card p-card">
      <Skeleton className="h-11 w-11 shrink-0 rounded-control" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-5 w-48 max-w-full" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-9 w-24 shrink-0 rounded-control" />
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <ListRowSkeleton key={i} />
      ))}
    </div>
  );
}
