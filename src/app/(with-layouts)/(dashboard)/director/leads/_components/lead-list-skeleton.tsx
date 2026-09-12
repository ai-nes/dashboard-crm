import { Skeleton } from "@/components/tailgrids/core/skeleton";

import { leadListGrid } from "./lead-list";

const skeletonRows = ["first", "second", "third", "fourth", "fifth", "sixth"];

export default function LeadListSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Đang tải danh sách Lead">
      <span className="sr-only">Đang tải danh sách Lead…</span>
      <ul className="divide-y divide-card-border" aria-hidden="true">
        {skeletonRows.map((row) => (
          <LeadListSkeletonRow key={row} />
        ))}
      </ul>
    </div>
  );
}

function LeadListSkeletonRow() {
  return (
    <li>
      <div
        className={`grid gap-4 px-4 py-4 ${leadListGrid} lg:items-center lg:px-5`}
      >
        <div className="min-w-0">
          <Skeleton className="h-4 w-20 max-w-full" />
        </div>

        <div className="min-w-0 space-y-2">
          <Skeleton className="h-4 w-32 max-w-full" />
          <Skeleton className="h-3 w-24 max-w-full" />
        </div>

        <div className="min-w-0">
          <Skeleton className="h-4 w-24 max-w-full" />
        </div>

        <div className="min-w-0">
          <Skeleton className="h-4 w-20 max-w-full" />
        </div>

        <div className="min-w-0">
          <Skeleton className="h-6 w-24 max-w-full rounded-full" />
        </div>

        <div className="min-w-0">
          <Skeleton className="h-6 w-20 max-w-full rounded-full" />
        </div>

        <div className="min-w-0">
          <Skeleton className="h-4 w-28 max-w-full" />
        </div>

        <div className="min-w-0">
          <Skeleton className="h-4 w-20 max-w-full" />
        </div>
      </div>
    </li>
  );
}
