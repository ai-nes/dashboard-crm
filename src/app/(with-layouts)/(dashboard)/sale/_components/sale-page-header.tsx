import { CalendarTime, CheckCircle1, UserMultiple1 } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import type { SaleOverviewMeta } from "@/services/api/sale";

interface SalePageHeaderProps {
  meta: SaleOverviewMeta;
}

function formatUpdatedAt(meta: SaleOverviewMeta): string {
  const timestamp = new Date(meta.asOf || `${meta.date}T12:00:00`);
  if (Number.isNaN(timestamp.getTime())) return "Chưa cập nhật";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "short",
    hour: meta.asOf ? "2-digit" : undefined,
    minute: meta.asOf ? "2-digit" : undefined,
    timeZone: meta.timezone,
  }).format(timestamp);
}

export default function SalePageHeader({ meta }: SalePageHeaderProps) {
  const admissionPeriod = meta.admissionYear > 0
    ? `Kỳ tuyển sinh ${meta.admissionYear}`
    : "Chưa xác định kỳ tuyển sinh";

  return (
    <header className="flex min-w-0 flex-col gap-4 border-b border-card-border pb-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge color="primary" prefixIcon={<CheckCircle1 aria-hidden="true" />}>SALE</Badge>
          <span className="text-xs text-text-tertiary">Cập nhật {formatUpdatedAt(meta)}</span>
        </div>
        <h1 className="mt-2 text-xl leading-7 font-semibold tracking-[-0.3px] text-text-primary sm:text-2xl">
          Tổng quan tuyển sinh
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Kết quả, việc cần xử lý và học sinh cần chăm sóc.
        </p>
      </div>

      <div className="flex min-w-0 flex-wrap items-center gap-2 sm:justify-end">
        <Badge color="gray" prefixIcon={<CalendarTime aria-hidden="true" />}>
          {admissionPeriod}
        </Badge>
        <Badge color="gray" prefixIcon={<UserMultiple1 aria-hidden="true" />}>
          Cá nhân · {meta.viewer.displayName || "Sale"}
        </Badge>
      </div>
    </header>
  );
}
