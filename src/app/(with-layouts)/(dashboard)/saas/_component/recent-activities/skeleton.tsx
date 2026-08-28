import { Skeleton } from "@/components/tailgrids/core/skeleton";

export function RecentActivitySkeletonRow() {
  return (
    <div className="flex items-start gap-3 py-3">
      <Skeleton className="size-9 shrink-0 rounded-full" />
      <div className="flex-1">
        <Skeleton className="mb-2 h-3.5 w-3/4 rounded-full" />
        <Skeleton className="h-3 w-16 rounded-full" />
      </div>
    </div>
  );
}

export default function RecentActivitiesSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex flex-col divide-y divide-border-secondary-alt">
      {Array.from({ length: count }).map((_, i) => (
        <RecentActivitySkeletonRow key={i} />
      ))}
    </div>
  );
}
