import { Skeleton } from "@/components/tailgrids/core/skeleton";
import { cn } from "@/utils/cn";

type DashboardSkeletonProps = {
  density?: "compact" | "standard";
};

function PageHeaderSkeleton({ action = true }: { action?: boolean }) {
  return (
    <header className="flex flex-col gap-4 px-2 pt-5 lg:flex-row lg:items-end lg:justify-between lg:px-6">
      <div className="space-y-3">
        <Skeleton className="h-7 w-52 rounded-lg" />
        <Skeleton className="h-4 w-[min(30rem,75vw)]" />
      </div>
      {action && <Skeleton className="h-10 w-32 rounded-lg" />}
    </header>
  );
}

function MetricSkeleton() {
  return (
    <div className="space-y-3 rounded-xl border border-card-border bg-card-background p-5">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-20 rounded-lg" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-card-border bg-card-background p-5",
        className,
      )}
    >
      <Skeleton className="h-5 w-40" />
      <Skeleton className="mt-2 h-3 w-56" />
      <Skeleton className="mt-6 h-56 w-full rounded-lg" />
    </div>
  );
}

function TableRowsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-card-border bg-card-background">
      <div className="grid grid-cols-[1.6fr_repeat(3,1fr)] gap-4 border-b border-card-border px-5 py-4">
        {["a", "b", "c", "d"].map((key) => (
          <Skeleton key={key} className="h-3 w-16" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="grid grid-cols-[1.6fr_repeat(3,1fr)] gap-4 border-b border-card-border px-5 py-4 last:border-b-0"
        >
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function DashboardRouteSkeleton({
  density = "standard",
}: DashboardSkeletonProps) {
  return (
    <main
      aria-busy="true"
      aria-label="Đang tải nội dung"
      className="space-y-5 px-2 py-4 pb-8 lg:px-6"
    >
      <PageHeaderSkeleton />
      <section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Đang tải chỉ số"
      >
        {Array.from({ length: 4 }, (_, index) => (
          <MetricSkeleton key={index} />
        ))}
      </section>
      <section
        className="grid gap-5 xl:grid-cols-5"
        aria-label="Đang tải biểu đồ"
      >
        <ChartSkeleton className="xl:col-span-3" />
        <ChartSkeleton className="xl:col-span-2" />
      </section>
      {density === "standard" && <TableRowsSkeleton />}
    </main>
  );
}

export function WorkspaceRouteSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="Đang tải không gian làm việc"
      className="min-w-0 space-y-5 px-2 py-4 pb-8 lg:px-6"
    >
      <div className="space-y-4 rounded-xl border border-card-border bg-card-background p-5 lg:p-6">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-8 w-64 rounded-lg" />
        <Skeleton className="h-4 w-[min(42rem,85vw)]" />
      </div>
      <section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Đang tải chỉ số"
      >
        {Array.from({ length: 4 }, (_, index) => (
          <MetricSkeleton key={index} />
        ))}
      </section>
      <section
        className="grid gap-5 xl:grid-cols-2"
        aria-label="Đang tải phân tích chi tiết"
      >
        {Array.from({ length: 4 }, (_, index) => (
          <ChartSkeleton key={index} className="min-h-72" />
        ))}
      </section>
    </main>
  );
}

export function ListRouteSkeleton({
  titleWidth = "w-60",
}: {
  titleWidth?: string;
}) {
  return (
    <main
      aria-busy="true"
      aria-label="Đang tải danh sách"
      className="space-y-5 px-2 py-4 pb-8 lg:px-6"
    >
      <PageHeaderSkeleton />
      <section className="rounded-xl border border-card-border bg-card-background p-4">
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-10 w-72 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </section>
      <div className="space-y-3">
        <Skeleton className={cn("h-5 rounded-lg", titleWidth)} />
        <TableRowsSkeleton rows={7} />
      </div>
    </main>
  );
}

export function ChatRouteSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="Đang tải Chatbot CRM"
      className="flex h-full min-h-[36rem] flex-col p-4 lg:p-6"
    >
      <div className="flex items-center justify-between border-b border-card-border pb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
      <div className="flex-1 space-y-5 py-6">
        {["first", "second", "third"].map((key, index) => (
          <div
            key={key}
            className={cn("flex gap-3", index === 1 && "justify-end")}
          >
            {index !== 1 && (
              <Skeleton className="size-8 shrink-0 rounded-full" />
            )}
            <div
              className={cn(
                "space-y-2",
                index === 1 ? "w-64" : "w-[min(28rem,75%)]",
              )}
            >
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-3 border-t border-card-border pt-4">
        <Skeleton className="h-12 flex-1 rounded-lg" />
        <Skeleton className="h-12 w-12 rounded-lg" />
      </div>
    </main>
  );
}
