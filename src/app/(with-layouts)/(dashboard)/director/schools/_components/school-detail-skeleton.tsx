import { Skeleton } from "@/components/tailgrids/core/skeleton";

const tabWidths = ["w-36", "w-28", "w-40", "w-32", "w-36"];
const territoryMetrics = ["distance", "travel", "students", "outside"];

export default function SchoolDetailSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="Đang tải hồ sơ trường học"
      className="min-w-0 px-2 py-4 pb-8 lg:px-6"
    >
      <span className="sr-only">Đang tải hồ sơ trường học…</span>
      <SchoolHeaderSkeleton />
      <div aria-hidden="true" className="mt-4 min-w-0">
        <div className="flex max-w-full gap-1 overflow-hidden border-b border-card-border px-1 py-1">
          {tabWidths.map((width) => (
            <Skeleton
              key={width}
              className={`h-9 ${width} shrink-0 rounded-lg`}
            />
          ))}
        </div>

        <div className="min-w-0 space-y-6 pt-6">
          <SchoolAnalysisSectionSkeleton hasAction />
          <SchoolAnalysisSectionSkeleton />
        </div>
      </div>
    </main>
  );
}

function SchoolHeaderSkeleton() {
  return (
    <header aria-hidden="true" className="min-w-0 shrink-0">
      <Skeleton className="mb-3 h-4 w-40 rounded-lg" />

      <div className="min-w-0 overflow-hidden rounded-2xl border border-card-border bg-card-background p-3 lg:p-4">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Skeleton className="size-8 shrink-0 rounded-lg" />
          <Skeleton className="h-6 w-64 max-w-full rounded-lg" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-3 w-32 max-w-full" />
          <Skeleton className="ml-auto h-8 w-24 rounded-lg" />
        </div>
        <Skeleton className="mt-3 h-4 w-[min(34rem,80%)] max-w-full" />
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {territoryMetrics.map((metric) => (
            <div
              key={metric}
              className="flex min-w-0 items-start gap-2.5 rounded-xl bg-background-soft-50 p-3"
            >
              <Skeleton className="size-8 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-3 w-16 max-w-full" />
                <Skeleton className="h-4 w-20 max-w-full rounded-lg" />
                <Skeleton className="h-3 w-24 max-w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}

function SchoolAnalysisSectionSkeleton({
  hasAction = false,
}: {
  hasAction?: boolean;
}) {
  return (
    <section aria-hidden="true" className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-5 w-44 rounded-lg" />
        {hasAction && <Skeleton className="h-7 w-28 rounded-lg" />}
      </div>
      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <SchoolPanelSkeleton lines={4} />
          <SchoolPanelSkeleton lines={4} />
        </div>
        {!hasAction && (
          <div className="grid gap-4 lg:grid-cols-2">
            <SchoolPanelSkeleton lines={5} />
            <SchoolPanelSkeleton lines={5} />
          </div>
        )}
      </div>
    </section>
  );
}

function SchoolPanelSkeleton({ lines }: { lines: number }) {
  return (
    <div className="min-h-48 min-w-0 rounded-xl border border-card-border bg-card-background p-5 lg:p-6">
      <div className="flex items-center justify-between gap-3 border-b border-card-border pb-3">
        <Skeleton className="h-4 w-44 max-w-full rounded-lg" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="mt-5 space-y-3">
        {Array.from({ length: lines }, (_, index) => (
          <Skeleton
            key={index}
            className={`h-4 max-w-full rounded-lg ${index === 1 ? "w-4/5" : index === 2 ? "w-3/5" : "w-full"}`}
          />
        ))}
      </div>
    </div>
  );
}
