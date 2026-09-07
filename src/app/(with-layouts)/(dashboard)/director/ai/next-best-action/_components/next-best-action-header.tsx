"use client";

import { Badge } from "@/components/tailgrids/core/badge";
import type { DirectorNbaRecommendationsMeta } from "@/services/api/nba";
import { formatNbaDateTime } from "@/services/api/nba/presentation";

interface NextBestActionHeaderProps {
  meta?: DirectorNbaRecommendationsMeta;
  recommendationCount: number;
}

export default function NextBestActionHeader({
  meta,
  recommendationCount,
}: NextBestActionHeaderProps) {
  const dataLabel = !meta
    ? "Đang tải"
    : meta.status === "available"
      ? "Đang có việc"
      : "Đang trống";

  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-primary-600 dark:text-primary-300">
          NBA tuyển sinh
        </p>
        <h1 className="mt-1 text-2xl leading-8 font-semibold text-text-primary">
          Việc cần xử lý
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {recommendationCount} đề xuất · Kỳ tuyển sinh{" "}
          {meta?.admissionYear ?? "—"}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-tertiary sm:justify-end">
        <Badge color={meta?.status === "available" ? "primary" : "gray"}>
          {dataLabel}
        </Badge>
        {meta?.asOf && <span>Cập nhật {formatNbaDateTime(meta.asOf)}</span>}
      </div>
    </header>
  );
}
