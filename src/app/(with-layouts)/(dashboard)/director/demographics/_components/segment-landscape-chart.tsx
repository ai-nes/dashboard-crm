"use client";

import { ArrowRight, InfoCircle } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { demographicSegments as defaultSegments } from "@/services/api/demographics/data";
import type { DemographicSegment } from "@/services/api/demographics/types";
import ChartEmptyState from "./chart-empty-state";

interface SegmentLandscapeChartProps {
  segments?: DemographicSegment[];
  onOpenSegment: (segmentId: string) => void;
}

export default function SegmentLandscapeChart({
  segments = defaultSegments,
  onOpenSegment,
}: SegmentLandscapeChartProps) {
  const rankedSegments = [...segments].sort((first, second) => second.opportunityScore - first.opportunityScore);

  return (
    <Card className="min-w-0 overflow-hidden bg-card-background p-0">
      <CardHeader className="border-b border-card-border p-5">
        <div>
          <CardTitle>Nhóm lead cần ưu tiên</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">
            Xếp theo điểm ưu tiên; mở nhóm để xem chi tiết.
          </p>
        </div>
        <InfoCircle size={17} className="text-text-tertiary" aria-label="Điểm ưu tiên do hệ thống tính" />
      </CardHeader>
      {rankedSegments.length === 0 ? (
        <ChartEmptyState message="Chưa có nhóm phù hợp với bộ lọc hiện tại." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead className="border-b border-card-border bg-background-gray-primary">
              <tr>
                <th scope="col" className="min-w-[280px] px-5 py-3 font-medium text-text-tertiary">Nhóm lead</th>
                <th scope="col" className="px-3 py-3 text-right font-medium text-text-tertiary">Tổng lead</th>
                <th scope="col" className="px-3 py-3 text-right font-medium text-text-tertiary">Đã tương tác</th>
                <th scope="col" className="px-3 py-3 text-right font-medium text-text-tertiary">Đã nộp hồ sơ</th>
                <th scope="col" className="px-3 py-3 text-right font-medium text-text-tertiary">Đã nhập học</th>
                <th scope="col" className="px-3 py-3 text-right font-medium text-text-tertiary">Tỷ lệ nhập học</th>
                <th scope="col" className="px-5 py-3 text-right font-medium text-text-tertiary"> </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {rankedSegments.map((segment) => (
                <tr key={segment.id} className="align-middle hover:bg-background-gray-primary">
                  <th scope="row" className="px-5 py-4 font-normal">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-background-gray-primary text-xs font-semibold text-text-tertiary">
                        {rankedSegments.indexOf(segment) + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-text-primary">{segment.name}</p>
                            <p className="mt-1 max-w-xl truncate text-xs text-text-tertiary">{segment.description}</p>
                          </div>
                          <Badge color={getPriorityTone(segment.opportunityScore)}>
                            Ưu tiên {segment.opportunityScore}/100
                          </Badge>
                        </div>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-background-gray-secondary">
                          <div
                            className={`h-full rounded-full ${getPriorityBar(segment.opportunityScore)}`}
                            style={{ width: `${Math.max(0, Math.min(100, segment.opportunityScore))}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </th>
                  <MetricCell value={segment.prospects} />
                  <MetricCell value={segment.engaged} />
                  <MetricCell value={segment.applications} />
                  <MetricCell value={segment.enrolled} tone="text-success-500" />
                  <MetricCell value={segment.conversion} suffix="%" />
                  <td className="px-5 py-4 text-right">
                    <Button size="xs" appearance="ghost" onPress={() => onOpenSegment(segment.id)}>
                      Xem chi tiết
                      <ArrowRight size={14} aria-hidden="true" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="border-t border-card-border px-5 py-3 text-[11px] text-text-tertiary">
        Điểm ưu tiên do hệ thống tính · “—” = chưa đủ dữ liệu.
      </div>
    </Card>
  );
}

function MetricCell({
  value,
  suffix = "",
  tone = "text-text-primary",
}: {
  value: number | null;
  suffix?: string;
  tone?: string;
}) {
  return (
    <td className={`whitespace-nowrap px-3 py-4 text-right font-semibold ${tone}`}>
      {value == null ? "—" : `${value.toLocaleString("vi-VN")}${suffix}`}
    </td>
  );
}

function getPriorityTone(score: number): "success" | "sky" | "warning" {
  if (score >= 85) return "success";
  if (score >= 70) return "sky";
  return "warning";
}

function getPriorityBar(score: number): string {
  if (score >= 85) return "bg-success-500";
  if (score >= 70) return "bg-info-500";
  return "bg-warning-500";
}
