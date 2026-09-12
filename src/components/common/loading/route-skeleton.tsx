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
  adminHeader = false,
}: {
  titleWidth?: string;
  adminHeader?: boolean;
}) {
  return (
    <main
      aria-busy="true"
      aria-label="Đang tải danh sách"
      className="space-y-5 px-2 py-4 pb-8 lg:px-6"
    >
      {adminHeader ? <AdminPageHeaderSkeleton /> : <PageHeaderSkeleton />}
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

function AdminPageHeaderSkeleton() {
  return (
    <header className="shrink-0">
      <div className="grid gap-4 lg:grid-cols-2 lg:items-end">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="size-2 rounded-full" />
            <Skeleton className="h-4 w-24 rounded-lg" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
          <Skeleton className="h-8 w-64 rounded-lg" />
          <Skeleton className="h-4 w-[min(40rem,85vw)]" />
        </div>
        <div className="flex flex-col gap-2 lg:items-end">
          <Skeleton className="h-3 w-64" />
          <Skeleton className="h-4 w-44" />
        </div>
      </div>
    </header>
  );
}

export function DetailRouteSkeleton({
  label = "Đang tải chi tiết",
  adminHeader = false,
}: {
  label?: string;
  adminHeader?: boolean;
}) {
  return (
    <main
      id="main-content"
      aria-busy="true"
      aria-label={label}
      className="min-w-0 space-y-5 px-2 py-4 pb-8 lg:px-6"
    >
      <span className="sr-only">{label}…</span>
      {adminHeader ? (
        <AdminPageHeaderSkeleton />
      ) : (
        <header className="space-y-4 rounded-xl border border-card-border bg-card-background p-5 lg:p-6">
          <Skeleton className="h-4 w-28 rounded-lg" />
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-3">
              <Skeleton className="h-7 w-[min(24rem,80vw)] rounded-lg" />
              <Skeleton className="h-4 w-[min(36rem,90vw)]" />
            </div>
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className="space-y-2 rounded-lg bg-background-soft-50 p-3"
              >
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-28 rounded-lg" />
              </div>
            ))}
          </div>
        </header>
      )}
      <section
        className="grid gap-5 xl:grid-cols-2"
        aria-label="Đang tải các phần chi tiết"
      >
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="min-h-48 rounded-xl border border-card-border bg-card-background p-5"
          >
            <Skeleton className="h-5 w-44 rounded-lg" />
            <div className="mt-5 space-y-3">
              {Array.from({ length: 4 }, (_, lineIndex) => (
                <Skeleton
                  key={lineIndex}
                  className={cn(
                    "h-4 rounded-lg",
                    lineIndex === 1 ? "w-4/5" : lineIndex === 2 ? "w-3/5" : "w-full",
                  )}
                />
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

export function BoardRouteSkeleton() {
  return (
    <main
      id="main-content"
      aria-busy="true"
      aria-label="Đang tải bảng công việc"
      className="min-w-0 space-y-5 px-2 py-4 pb-8 lg:px-6"
    >
      <PageHeaderSkeleton />
      <div className="flex flex-wrap gap-3 rounded-xl border border-card-border bg-card-background p-4">
        <Skeleton className="h-10 w-72 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
      <section
        className="grid gap-4 xl:grid-cols-4"
        aria-label="Đang tải các cột công việc"
      >
        {Array.from({ length: 4 }, (_, columnIndex) => (
          <div
            key={columnIndex}
            className="min-h-96 rounded-xl border border-card-border bg-card-background p-4"
          >
            <div className="flex items-center justify-between gap-3 border-b border-card-border pb-4">
              <Skeleton className="h-5 w-28 rounded-lg" />
              <Skeleton className="size-6 rounded-full" />
            </div>
            <div className="mt-4 space-y-3">
              {Array.from({ length: 3 }, (_, cardIndex) => (
                <div
                  key={cardIndex}
                  className="space-y-3 rounded-lg border border-card-border p-4"
                >
                  <Skeleton className="h-4 w-4/5 rounded-lg" />
                  <Skeleton className="h-3 w-full" />
                  <div className="flex items-center justify-between gap-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

export function ConfigurationRouteSkeleton() {
  return (
    <main
      id="main-content"
      aria-busy="true"
      aria-label="Đang tải cấu hình"
      className="flex h-full min-h-0 min-w-0 flex-col gap-4 px-2 pt-4 lg:px-6"
    >
      <AdminPageHeaderSkeleton />
      <div className="flex gap-2 overflow-hidden border-b border-card-border px-1 pb-2">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-9 w-32 shrink-0 rounded-lg" />
        ))}
      </div>
      <section className="min-h-0 flex-1 rounded-xl border border-card-border bg-card-background p-5 lg:p-6">
        <div className="flex items-center justify-between gap-3 border-b border-card-border pb-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-48 rounded-lg" />
            <Skeleton className="h-3 w-64" />
          </div>
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export function BuilderRouteSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="Đang tải trình chỉnh sửa"
      className="flex h-dvh min-h-0 flex-col bg-card-background"
    >
      <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-card-border px-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <Skeleton className="size-9 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-44 rounded-lg" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-hidden p-4 sm:p-6">
        <div className="grid h-full min-h-0 gap-5 lg:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.2fr)]">
          <section className="min-h-0 rounded-xl border border-card-border bg-card-surface-area p-5">
            <Skeleton className="h-5 w-40 rounded-lg" />
            <div className="mt-5 space-y-4">
              {Array.from({ length: 5 }, (_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              ))}
            </div>
          </section>
          <section className="min-h-0 rounded-xl border border-card-border bg-card-surface-area p-5">
            <Skeleton className="h-5 w-52 rounded-lg" />
            <Skeleton className="mt-2 h-3 w-72 max-w-full" />
            <Skeleton className="mt-6 h-[min(32rem,70vh)] w-full rounded-xl" />
          </section>
        </div>
      </div>
    </main>
  );
}
