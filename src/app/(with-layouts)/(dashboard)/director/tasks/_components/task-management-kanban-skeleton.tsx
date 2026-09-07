import { Skeleton } from "@/components/tailgrids/core/skeleton";

function TaskManagementKanbanCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="rounded-lg border border-card-border bg-card-background p-3.5 shadow-xs"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Skeleton className="size-7 rounded-md" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="size-7 rounded-md" />
      </div>

      <div className="mt-3 space-y-2">
        <Skeleton className="h-4 w-11/12" />
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-card-border pt-2.5">
        <Skeleton className="h-3 w-24" />
        <div className="flex items-center gap-2">
          <Skeleton className="size-7 rounded-full" />
          <Skeleton className="h-3 w-16" />
        </div>
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
