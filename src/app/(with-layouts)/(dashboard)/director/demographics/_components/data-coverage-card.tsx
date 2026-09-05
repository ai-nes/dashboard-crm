import { InfoTriangle, Shield1Check } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { dataCoverageMetrics as defaultMetrics } from "@/services/api/demographics/data";
import type { DataCoverageMetric } from "@/services/api/demographics/types";
import StudentCardEmptyState from "../../students/_components/student-card-empty-state";

const toneStyles = {
  success: { bar: "bg-success-500", text: "text-success-500" },
  warning: { bar: "bg-warning-500", text: "text-warning-500" },
  danger: { bar: "bg-error-500", text: "text-error-500" },
};

interface DataCoverageCardProps {
  metrics?: DataCoverageMetric[];
}

export default function DataCoverageCard({ metrics = defaultMetrics }: DataCoverageCardProps) {
  const hasMetrics = metrics.length > 0;
  const overallTone = hasMetrics ? getOverallCoverageTone(metrics) : null;

  return (
    <Card className="flex h-full min-w-0 flex-col bg-card-background">
      <CardHeader className="mb-4 items-start">
        <div>
          <CardTitle>Mức độ đầy đủ dữ liệu</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Kiểm tra trường nào còn thiếu trước khi phân tích.</p>
        </div>
        {overallTone ? (
          <Badge color={overallTone === "success" ? "success" : overallTone === "warning" ? "warning" : "error"}>
            {overallTone === "success" ? <Shield1Check size={13} aria-hidden="true" /> : <InfoTriangle size={13} aria-hidden="true" />}
            {getOverallCoverageLabel(overallTone)}
          </Badge>
        ) : null}
      </CardHeader>
      {hasMetrics ? (
        <>
          <div className="space-y-4">
            {metrics.map((metric) => {
              const tone = toneStyles[getCoverageTone(metric.value, metric.tone)] ?? toneStyles.warning;
              return (
                <div key={metric.label}>
                  <div className="mb-1.5 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-text-secondary">{metric.label}</p>
                      <p className="mt-0.5 text-[10px] text-text-tertiary">{metric.detail}</p>
                    </div>
                    <span className={`text-xs font-semibold ${tone.text}`}>{metric.value}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-background-gray-secondary">
                    <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${metric.value}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-auto pt-5">
            <div className="flex items-start gap-2 rounded-xl border border-card-border bg-background-gray-primary p-3 text-xs leading-5 text-text-tertiary">
              <InfoTriangle size={15} className="mt-0.5 shrink-0 text-warning-500" aria-hidden="true" />
              <span>{getCoverageNote(metrics)}</span>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <StudentCardEmptyState message="Chưa có dữ liệu để đánh giá mức độ đầy đủ." />
        </div>
      )}
    </Card>
  );
}

function getCoverageTone(value: number, tone: DataCoverageMetric["tone"]): DataCoverageMetric["tone"] {
  if (value <= 0) return "danger";
  if (value < 50) return "warning";
  return tone;
}

function getOverallCoverageTone(metrics: DataCoverageMetric[]): DataCoverageMetric["tone"] {
  const lowestValue = Math.min(...metrics.map((metric) => metric.value), 0);
  if (lowestValue <= 0) return "danger";
  if (lowestValue < 50) return "warning";
  return "success";
}

function getOverallCoverageLabel(tone: DataCoverageMetric["tone"]): string {
  if (tone === "danger") return "Thiếu dữ liệu quan trọng";
  if (tone === "warning") return "Cần bổ sung dữ liệu";
  return "Đang kiểm soát";
}

function getCoverageNote(metrics: DataCoverageMetric[]): string {
  const weakest = [...metrics].sort((first, second) => first.value - second.value)[0];
  if (!weakest || weakest.value <= 0) return "Một số trường chưa có dữ liệu chuẩn; không dùng chúng để suy luận nhóm.";
  return `${weakest.label} mới có ở ${weakest.value}% học sinh. Kết quả theo tiêu chí này có thể chưa đại diện.`;
}
