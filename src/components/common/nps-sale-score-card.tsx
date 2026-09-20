"use client";

import { InfoCircle, RefreshCircle1Clockwise } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { Skeleton } from "@/components/tailgrids/core/skeleton";
import { useNpsSaleSummaryQuery } from "@/hooks/use-interaction-intelligence-queries";

export default function NpsSaleScoreCard() {
  const query = useNpsSaleSummaryQuery();
  const records = [...(query.data?.records ?? [])].sort(
    (left, right) => right.average_normalized_score - left.average_normalized_score,
  );

  return (
    <Card className="min-w-0 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-text-primary">Call Quality theo Sale</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Trung bình bốn tiêu chí từ các cuộc gọi đã có evidence hợp lệ.
          </p>
        </div>
        {query.data ? <Badge color="primary" size="sm">{query.data.total_points} điểm</Badge> : null}
      </div>

      {query.isPending ? (
        <div className="mt-4 space-y-2" aria-busy="true">
          {Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-12 rounded-lg" />)}
        </div>
      ) : null}

      {query.isError ? (
        <div className="mt-4 rounded-lg bg-badge-error-background p-3 text-sm text-error-600" role="alert">
          <p className="flex items-start gap-2"><InfoCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />Không thể tải bảng điểm Sale.</p>
          <Button type="button" appearance="ghost" size="sm" className="mt-2 min-h-10 px-0" onPress={() => query.refetch()}>
            <RefreshCircle1Clockwise size={16} />
            Thử lại
          </Button>
        </div>
      ) : null}

      {!query.isPending && !query.isError && records.length === 0 ? (
        <p className="mt-4 text-sm text-text-secondary">Chưa có cuộc gọi nào được chấm.</p>
      ) : null}

      {!query.isPending && !query.isError && records.length > 0 ? (
        <div className="mt-4 divide-y divide-card-border/70">
          {records.map((record) => (
            <div key={record.sale} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text-primary">{record.sale}</p>
                <p className="mt-1 text-xs text-text-tertiary">{record.count} cuộc gọi có điểm</p>
              </div>
              <div className="text-right">
                <p className="text-base font-semibold text-text-primary">{record.average_score.toFixed(2)}/10</p>
                <p className="text-xs text-text-tertiary">{record.average_normalized_score.toFixed(1)}/100</p>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </Card>
  );
}
