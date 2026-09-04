import { Skeleton } from "@/components/tailgrids/core/skeleton";

function PanelSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-xl border border-card-border bg-card-background p-4 lg:p-5 ${className}`}
      aria-hidden="true"
    >
      <div className="space-y-3 border-b border-card-border pb-5">
        <Skeleton className="h-5 w-32 rounded-full" />
        <Skeleton className="h-5 w-44 rounded-lg" />
        <Skeleton className="h-3 w-56" />
      </div>
      <div className="mt-4 space-y-2">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-14 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function NbaActionsLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Đang tải cấu hình Action NBA"
      className="min-w-0 space-y-5 px-2 py-4 pb-8 lg:px-6"
    >
      <header className="space-y-3 rounded-xl border border-card-border bg-card-background p-5 lg:p-6">
        <Skeleton className="h-5 w-32 rounded-full" />
        <Skeleton className="h-8 w-64 rounded-lg" />
        <Skeleton className="h-4 w-[min(40rem,85vw)]" />
      </header>
      <section className="grid gap-5 xl:grid-cols-[minmax(18rem,26rem)_minmax(0,1fr)]">
        <PanelSkeleton />
        <PanelSkeleton className="min-h-[35rem]" />
      </section>
    </main>
  );
}
