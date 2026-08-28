import { Skeleton } from "@/components/tailgrids/core/skeleton";

export function CustomerGrowthStatSkeleton() {
  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center gap-3">
        <Skeleton className="size-2.5 shrink-0 rounded-xs" />
        <Skeleton className="h-4 w-28 rounded-full" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-7 w-20 rounded-lg md:h-8 md:w-24" />
        <span className="flex items-center gap-1">
          <Skeleton className="h-4 w-12 rounded-full" />
          <Skeleton className="h-4 w-20 rounded-full" />
        </span>
      </div>
    </div>
  );
}

export default function CustomerGrowthSkeleton() {
  return (
    <div className="flex h-67.5 w-full items-end gap-3 border-b border-dashed border-border-secondary-alt px-2 pb-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-1 items-end gap-1">
          <Skeleton
            className="w-1/2 animate-pulse-custom rounded-t-sm"
            style={{ height: `${30 + ((i * 13) % 60)}%` }}
          />
          <Skeleton
            className="w-1/2 animate-pulse-custom rounded-t-sm"
            style={{ height: `${15 + ((i * 9) % 35)}%` }}
          />
        </div>
      ))}
    </div>
  );
}
