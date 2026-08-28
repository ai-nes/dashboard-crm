import { Skeleton } from "@/components/tailgrids/core/skeleton";

const BAR_HEIGHTS = [55, 68, 80, 72, 95, 40, 32];

export default function WeeklyAiActivitySkeleton() {
  return (
    <div className="flex h-67.5 w-full items-end justify-between gap-3 border-b border-dashed border-border-secondary-alt px-2 pb-6">
      {BAR_HEIGHTS.map((height, index) => (
        <Skeleton
          key={index}
          className="w-full rounded-t-md rounded-b-none"
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
}
