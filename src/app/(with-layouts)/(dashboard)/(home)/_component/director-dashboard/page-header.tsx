import type { OverviewMeta } from "./types";

interface DirectorPageHeaderProps {
  meta?: OverviewMeta;
}

export default function DirectorPageHeader({ meta }: DirectorPageHeaderProps) {
  const freshness = meta?.freshnessLabel ?? "Dữ liệu cập nhật 2 phút trước";
  const scopeText = `${meta?.scopeLabel ?? "Toàn bộ cơ sở"} · Niên khóa ${meta?.admissionYear ?? 2026}`;

  return (
    <header className="min-w-0 px-2 lg:px-6">
      <div className="min-w-0 overflow-hidden rounded-2xl border border-card-border bg-background-gray-primary p-5 lg:p-6">
        <div className="flex min-w-0 flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-badge-success-background px-2.5 py-1 text-xs font-medium text-badge-success-text">
                <span className="size-1.5 rounded-full bg-badge-success-icon-color" />
                {freshness}
              </span>
              <span className="text-xs text-text-tertiary">{scopeText}</span>
            </div>
            <h1 className="mb-1 text-[28px] leading-8 font-medium text-text-primary">Tổng quan tuyển sinh</h1>
            <p className="max-w-2xl text-sm leading-5 text-text-tertiary">
              Theo dõi chỉ tiêu, hồ sơ, nhập học và việc cần xử lý.
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
