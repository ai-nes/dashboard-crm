import { Skeleton } from "@/components/tailgrids/core/skeleton";

export default function PlanMixSkeleton() {
  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-center">
      <div className="relative flex size-40 shrink-0 items-center justify-center">
        <Skeleton className="size-40 rounded-full" />
        <div className="absolute size-24 rounded-full bg-card-background" />
      </div>

      <div className="flex w-full flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Skeleton className="size-2.5 shrink-0 rounded-full" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-14 rounded-full" />
              <Skeleton className="h-4 w-8 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
