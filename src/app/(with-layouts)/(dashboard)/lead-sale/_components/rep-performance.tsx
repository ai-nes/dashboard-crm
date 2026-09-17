"use client";

import { ArrowRight } from "@tailgrids/icons";
import { useMemo, useState } from "react";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import {
  LEAD_SALE_HEALTH_THRESHOLDS,
  type LeadSaleDetailId,
  type LeadSaleRepPerformance,
} from "./lead-sale-dashboard.types";

interface RepPerformanceProps {
  reps: LeadSaleRepPerformance[];
  onOpenDetail: (detailId: LeadSaleDetailId) => void;
}

export default function RepPerformance({ reps, onOpenDetail }: RepPerformanceProps) {
  const [sortKey, setSortKey] = useState<SortKey>("remaining");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const sortedReps = useMemo(() => {
    return [...reps].sort((left, right) => {
      const difference = sortValue(right, sortKey) - sortValue(left, sortKey);
      return sortDirection === "asc" ? -difference : difference;
    });
  }, [reps, sortDirection, sortKey]);

  const handleSort = (nextKey: SortKey) => {
    if (nextKey === sortKey) {
      setSortDirection((direction) => direction === "asc" ? "desc" : "asc");
      return;
    }
    setSortKey(nextKey);
    setSortDirection("desc");
  };

  return (
    <Card className="min-w-0 p-5 sm:p-6">
      <CardHeader className="items-start">
        <div>
          <CardTitle>Hiệu suất nhân viên tư vấn</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">
            So sánh mức đạt chỉ tiêu, pipeline và các chỉ số cần hỗ trợ của từng nhân viên.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-text-tertiary">
          <span className="size-2 rounded-full bg-badge-error-text" aria-hidden="true" /> Cần hỗ trợ theo ngưỡng
        </div>
      </CardHeader>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[66rem] border-collapse text-sm" aria-label="Bảng hiệu suất nhân viên tư vấn">
          <thead>
            <tr className="border-b border-card-border text-[10px] font-medium text-text-tertiary">
              <th scope="col" className="min-w-52 px-2 pb-3 text-left font-medium">Nhân viên tư vấn</th>
              <SortHeader label="Chỉ tiêu" sortKey="target" activeKey={sortKey} direction={sortDirection} onSort={handleSort} />
              <SortHeader label="Nhập học" sortKey="enrollment" activeKey={sortKey} direction={sortDirection} onSort={handleSort} />
              <SortHeader label="Mức đạt" sortKey="achievement" activeKey={sortKey} direction={sortDirection} onSort={handleSort} />
              <SortHeader label="Còn thiếu" sortKey="remaining" activeKey={sortKey} direction={sortDirection} onSort={handleSort} />
              <SortHeader label="Dự kiến" sortKey="expected" activeKey={sortKey} direction={sortDirection} onSort={handleSort} />
              <SortHeader label="Cơ hội mở" sortKey="openOpportunities" activeKey={sortKey} direction={sortDirection} onSort={handleSort} />
              <SortHeader label="Độ phủ chỉ tiêu" sortKey="coverage" activeKey={sortKey} direction={sortDirection} onSort={handleSort} />
              <SortHeader label="Tỷ lệ nhập học" sortKey="winRate" activeKey={sortKey} direction={sortDirection} onSort={handleSort} />
              <SortHeader label="Quá hạn" sortKey="overdue" activeKey={sortKey} direction={sortDirection} onSort={handleSort} />
              <SortHeader label="Thời gian TB / SLA" sortKey="avgStageAgeDays" activeKey={sortKey} direction={sortDirection} onSort={handleSort} />
              <th scope="col" className="w-16 px-2 pb-3 text-center font-medium">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            {sortedReps.map((rep) => {
              const isRisk = rep.coverage < LEAD_SALE_HEALTH_THRESHOLDS.minCoverage
                || rep.overdue > LEAD_SALE_HEALTH_THRESHOLDS.maxOverdue
                || rep.avgStageAgeDays > LEAD_SALE_HEALTH_THRESHOLDS.maxAvgStageAgeDays;

              return (
                <tr key={rep.id} className="transition-colors hover:bg-background-soft-50">
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-[10px] font-bold text-primary-600">{rep.initials}</span>
                      <span className="whitespace-nowrap font-semibold text-text-primary">{rep.name}</span>
                    </div>
                  </td>
                  <td className="px-2 py-3 text-right text-text-secondary">{rep.target}</td>
                  <td className="px-2 py-3 text-right font-semibold text-success-500">{rep.enrollment}</td>
                  <td className="px-2 py-3 text-right font-semibold text-text-primary">{rep.achievement}%</td>
                  <td className="px-2 py-3 text-right font-semibold text-warning-500">{rep.remaining}</td>
                  <td className="px-2 py-3 text-right text-text-primary">{rep.expected}</td>
                  <td className="px-2 py-3 text-right text-text-primary">{rep.openOpportunities}</td>
                  <td className="px-2 py-3 text-right"><Badge color={rep.coverage >= 1 ? "success" : "error"} size="sm">{rep.coverage.toFixed(2).replace(".", ",")}x</Badge></td>
                  <td className="px-2 py-3 text-right text-text-primary">{rep.winRate}%</td>
                  <td className={`px-2 py-3 text-right font-semibold ${rep.overdue > 0 ? "text-badge-error-text" : "text-text-primary"}`}>{rep.overdue}</td>
                  <td className="px-2 py-3 text-right" title={`${rep.agingOverSlaCount} hồ sơ vượt SLA`}><span className={isRisk ? "font-semibold text-warning-500" : "text-text-secondary"}>{rep.avgStageAgeDays} ngày · {rep.agingOverSlaCount} SLA</span></td>
                  <td className="px-2 py-3 text-center">
                    <Button
                      type="button"
                      size="xs"
                      variant="ghost"
                      appearance="ghost"
                      onPress={() => onOpenDetail(rep.detailId)}
                      aria-label={`Xem chi tiết ${rep.name}`}
                      className="mx-auto size-8 p-0 text-text-tertiary hover:text-text-primary"
                    >
                      <ArrowRight size={15} aria-hidden="true" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

type SortKey = "target" | "enrollment" | "achievement" | "remaining" | "expected" | "openOpportunities" | "coverage" | "winRate" | "overdue" | "avgStageAgeDays";
type SortDirection = "asc" | "desc";

function sortValue(rep: LeadSaleRepPerformance, key: SortKey) {
  return rep[key];
}

function SortHeader({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  direction: SortDirection;
  onSort: (key: SortKey) => void;
}) {
  const isActive = activeKey === sortKey;

  return (
    <th scope="col" className="min-w-24 px-2 pb-3 text-right font-medium">
      <Button
        type="button"
        size="xs"
        variant="ghost"
        appearance="ghost"
        onPress={() => onSort(sortKey)}
        className="h-auto min-h-0 w-full justify-end gap-1 p-0 text-[10px] font-medium text-text-tertiary hover:text-text-primary"
      >
        {label}
        <span aria-hidden="true" className={isActive ? "text-primary-600" : "text-text-tertiary"}>
          {isActive ? (direction === "asc" ? "↑" : "↓") : "↕"}
        </span>
      </Button>
    </th>
  );
}
