import { Skeleton } from "@/components/tailgrids/core/skeleton";

function TaskManagementKanbanCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="rounded-lg border border-card-border bg-card-background p-2.5"
    >
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5">
          <Skeleton className="size-6 rounded-md" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="size-6 rounded-md" />
      </div>

      <div className="mt-2 space-y-1.5">
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      <div className="mt-2.5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 border-t border-card-border pt-2.5">
        <div className="flex items-center gap-2">
          <Skeleton className="size-7 rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-32 max-w-full" />
        <Skeleton className="h-3 w-12" />
        <Skeleton className="col-span-2 h-3 w-24" />
      </div>
    </div>
  );
}

export default function TaskManagementKanbanSkeleton({
  count = 3,
}: {
  count?: number;
}) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <TaskManagementKanbanCardSkeleton key={index} />
      ))}
    </>
  );
}
