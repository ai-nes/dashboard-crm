import { Skeleton } from "@/components/tailgrids/core/skeleton";
import { SKELETON_ITEM_COUNT } from "./utils";

export default function RecentActivitiesSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: SKELETON_ITEM_COUNT }).map((_, i) => (
        <div key={i} className="flex items-start gap-3">
          <Skeleton className="size-8 shrink-0 rounded-full" />
          <div className="flex-1">
            <Skeleton className="mb-2 h-3.5 w-3/4" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
