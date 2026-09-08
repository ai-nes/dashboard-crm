import Link from "next/link";

export function SegmentDetailPlaceholder({ backHref }: { backHref: string }) {
  return (
    <main id="main-content" className="space-y-4 px-2 py-4 lg:px-6">
      <Link
        href={backHref}
        className="inline-flex rounded-lg border border-card-border bg-card-background px-4 py-2 text-sm text-text-secondary hover:bg-background-gray-secondary_alt"
      >
        Quay lại quản lý segments
      </Link>
      <section className="rounded-2xl border border-card-border bg-card-background p-6">
        <h1 className="text-2xl font-semibold text-text-primary">
          Chi tiết segment
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Nội dung chi tiết sẽ được bổ sung sau.
        </p>
      </section>
    </main>
  );
}
