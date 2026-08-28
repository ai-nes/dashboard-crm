import { Skeleton } from "@/components/tailgrids/core/skeleton";

export function ExchangeStockRowSkeleton() {
  return (
    <div className="flex items-center justify-between border-b border-border-primary py-3 first:pt-0 last:border-0 last:pb-0">
      <div className="flex items-center gap-3">
        <Skeleton className="size-9 shrink-0 rounded-full" />
        <div>
          <Skeleton className="mb-1.5 h-3.5 w-14 rounded-full" />
          <Skeleton className="h-3 w-16 rounded-full" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-3.5 w-16 rounded-full" />
        <Skeleton className="h-7.5 w-16 rounded-lg" />
        <Skeleton className="h-7.5 w-16 rounded-lg" />
      </div>
    </div>
  );
}
