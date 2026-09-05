"use client";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card } from "@/components/tailgrids/core/card";
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
    ? "Đang tải hàng đợi"
    : meta.status === "available"
      ? "Đang có đề xuất"
      : "Chưa có đề xuất";

  return (
    <Card className="flex flex-col gap-5 p-5 lg:flex-row lg:items-end lg:justify-between lg:p-6">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge color="primary">AI tuyển sinh · NBA</Badge>
          <span className="text-xs text-text-tertiary">
            {dataLabel} · Kỳ tuyển sinh {meta?.admissionYear ?? "—"}
          </span>
          {meta?.asOf && (
            <span className="text-xs text-text-tertiary">
              Cập nhật {formatNbaDateTime(meta.asOf)}
            </span>
          )}
        </div>
        <h1 className="mt-3 text-balance text-[28px] leading-8 font-semibold tracking-[-0.4px] text-text-primary">
          Đề xuất chăm sóc tiếp theo
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
          Xem hồ sơ nào cần được chăm sóc tiếp theo, kiểm tra đề xuất của hệ
          thống và ghi nhận quyết định trong hồ sơ học sinh.
        </p>
        <p className="mt-3 text-xs leading-5 text-text-tertiary">
          {recommendationCount} đề xuất cần xem xét
          {meta?.metricKind === "observational" && meta.metricDisclaimer && (
            <span className="block mt-1">
              Lưu ý: {formatMetricDisclaimer(meta.metricDisclaimer)}
            </span>
          )}
        </p>
      </div>
    </Card>
  );
}

function formatMetricDisclaimer(value: string): string {
  return value.replace(/\bActions?\b/gi, "đề xuất");
}
