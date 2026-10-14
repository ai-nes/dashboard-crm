import { Skeleton } from "@/components/tailgrids/core/skeleton";

export default function ReminderSkeleton() {
  return (
    <div
      className="space-y-5 p-4 lg:p-6"
      role="status"
      aria-label="Đang tải cấu hình email nhắc task"
    >
      <Skeleton className="h-8 w-64 max-w-full" />
      <Skeleton className="h-5 w-96 max-w-full" />
      <div className="grid gap-5 lg:grid-cols-2">
        <Skeleton className="h-64 w-full rounded-xl motion-reduce:animate-none" />
        <Skeleton className="h-64 w-full rounded-xl motion-reduce:animate-none" />
      </div>
      <Skeleton className="h-56 w-full rounded-xl motion-reduce:animate-none" />
    </div>
  );
}
