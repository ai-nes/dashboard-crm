import { Skeleton } from "@/components/tailgrids/core/skeleton";

export default function NbaActionsLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Đang tải dữ liệu cấu hình NBA"
      className="min-w-0 space-y-6 px-2 py-4 pb-8 lg:px-6"
    >
      <header className="space-y-3">
        <Skeleton className="h-4 w-48 rounded-lg" />
        <Skeleton className="h-8 w-64 rounded-lg" />
        <Skeleton className="h-4 w-[min(40rem,85vw)]" />
      </header>

      <section className="overflow-hidden rounded-xl border border-card-border bg-card-background" aria-hidden="true">
        <div className="space-y-4 border-b border-card-border p-4 lg:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-3 w-44" />
            </div>
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-10 w-full rounded-lg" />
          <div className="flex gap-3">
            <Skeleton className="h-8 w-40 rounded-lg" />
            <Skeleton className="h-8 w-40 rounded-lg" />
          </div>
        </div>
        <div className="space-y-0 p-5">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="grid min-h-20 grid-cols-6 items-center gap-5 border-b border-card-border">
              <Skeleton className="h-9 w-56" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="ml-auto h-8 w-20" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
