import { Skeleton } from "@/components/tailgrids/core/skeleton";

export default function UpcomingTasksSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex min-h-40 flex-col gap-3 rounded-lg border border-border-primary p-3">
          <div>
            <Skeleton className="mb-1.5 h-3.5 w-8" />
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="h-14 w-full rounded-md" />
        </div>
      ))}
    </div>
  );
}
