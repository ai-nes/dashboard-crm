import { Skeleton } from "@/components/tailgrids/core/skeleton";

export default function AiProviderDistributionSkeleton() {
  return (
    <div className="flex h-75 flex-col items-center justify-between">
      <div className="flex flex-1 items-center justify-center">
        <Skeleton className="size-52 rounded-full" />
      </div>
      <div className="flex w-full flex-wrap justify-center gap-x-5 gap-y-2 pt-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <Skeleton className="size-2 rounded-xs" />
            <Skeleton className="h-3.5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
