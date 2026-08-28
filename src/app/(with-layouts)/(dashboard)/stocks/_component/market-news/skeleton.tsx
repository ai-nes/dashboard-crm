import { Skeleton } from "@/components/tailgrids/core/skeleton";

export function MarketNewsRowSkeleton() {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border-primary py-3 first:pt-0 last:border-0 last:pb-0">
      <Skeleton className="h-3.5 w-full max-w-100 rounded-full" />
      <Skeleton className="h-3.5 w-24 shrink-0 rounded-full" />
    </div>
  );
}
