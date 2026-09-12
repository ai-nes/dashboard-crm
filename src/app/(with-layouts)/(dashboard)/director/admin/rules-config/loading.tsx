import { Skeleton } from "@/components/tailgrids/core/skeleton";

export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-label="Đang tải cấu hình Rule"
      className="flex h-full min-h-0 min-w-0 flex-col gap-2 px-2 py-4 lg:px-6"
    >
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
      <section className="min-h-0 flex-1 rounded-xl border border-card-border bg-card-background" aria-hidden="true">
        <Skeleton className="m-5 h-10 rounded-lg" />
        <Skeleton className="mx-5 h-96 rounded-lg" />
      </section>
    </main>
  );
}
