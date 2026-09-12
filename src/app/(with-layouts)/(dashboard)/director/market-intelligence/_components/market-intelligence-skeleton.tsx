import { Skeleton } from "@/components/tailgrids/core/skeleton";

const inspectorRows = ["first", "second", "third", "fourth", "fifth"];

export default function MarketIntelligenceSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="Đang tải bản đồ và phân tích thị trường"
      className="min-w-0 px-2 py-3 lg:px-6 xl:h-[calc(100vh-112px)] xl:overflow-hidden"
    >
      <span className="sr-only">Đang tải bản đồ và phân tích thị trường…</span>
      <div className="grid min-h-[640px] min-w-0 grid-cols-1 items-stretch gap-2 xl:h-full xl:min-h-0 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.75fr)]">
        <MarketMapSkeleton />
        <MarketInspectorSkeleton />
      </div>
    </main>
  );
}

function MarketMapSkeleton() {
  return (
    <section
      aria-hidden="true"
      className="flex h-full min-h-[640px] min-w-0 flex-col overflow-hidden rounded-2xl bg-card-background p-3 xl:min-h-0"
    >
      <div className="flex items-center justify-between gap-3 pb-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <Skeleton className="size-8 shrink-0 rounded-lg" />
          <div className="min-w-0 space-y-1.5">
            <Skeleton className="h-4 w-48 max-w-full rounded-lg" />
            <Skeleton className="h-3 w-36 max-w-full" />
          </div>
        </div>
        <Skeleton className="h-6 w-28 shrink-0 rounded-full" />
      </div>

      <div className="mb-2 flex items-center justify-between gap-2 border-t border-card-surface-border/50 pt-2">
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-7 w-36 rounded-lg" />
          <Skeleton className="h-7 w-28 rounded-lg" />
        </div>
        <Skeleton className="h-7 w-40 rounded-lg" />
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl bg-background-soft-50 p-1 ring-1 ring-card-border/50">
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 rounded-lg bg-card-background/90 p-0.5 shadow-xs">
          <Skeleton className="size-6 rounded" />
          <Skeleton className="size-6 rounded" />
          <Skeleton className="size-6 rounded" />
        </div>
        <div className="absolute top-2.5 right-2.5 flex items-center gap-3 rounded-lg bg-card-background/90 px-2.5 py-1.5 shadow-xs">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-14" />
        </div>
        <div className="flex h-[76%] w-[58%] max-w-[420px] items-center justify-center gap-2">
          <Skeleton className="h-[92%] w-[58%] rounded-[42%]" />
          <div className="flex h-full w-[30%] flex-col justify-center gap-2">
            <Skeleton className="h-1/3 w-full rounded-[45%]" />
            <Skeleton className="h-1/4 w-3/4 self-end rounded-[45%]" />
          </div>
        </div>
      </div>
    </section>
  );
}

function MarketInspectorSkeleton() {
  return (
    <aside
      aria-hidden="true"
      className="flex min-h-[640px] min-w-0 flex-col overflow-hidden rounded-2xl bg-card-background p-4 xl:min-h-0"
    >
      <div className="flex items-start justify-between gap-3 border-b border-card-border pb-3">
        <div className="min-w-0 space-y-2">
          <Skeleton className="h-5 w-48 max-w-full rounded-lg" />
          <Skeleton className="h-3 w-64 max-w-full" />
        </div>
        <Skeleton className="size-8 shrink-0 rounded-lg" />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Skeleton className="h-8 flex-1 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>

      <div className="mt-4 space-y-3">
        {inspectorRows.map((row) => (
          <div
            key={row}
            className="flex items-start gap-3 border-b border-card-border pb-3 last:border-b-0"
          >
            <Skeleton className="size-8 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-40 max-w-full rounded-lg" />
              <Skeleton className="h-3 w-28 max-w-full" />
            </div>
            <Skeleton className="h-5 w-14 shrink-0 rounded-full" />
          </div>
        ))}
      </div>
    </aside>
  );
}
