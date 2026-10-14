"use client";

import { useState } from "react";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { Skeleton } from "@/components/tailgrids/core/skeleton";
import { useAuth } from "@/components/common/auth/auth-provider";
import { getNpsDashboardAccess } from "@/components/common/auth/permissions";
import { useNpsHistoryQuery, useNpsSaleSummaryQuery } from "@/hooks/use-interaction-intelligence-queries";
import NpsCallHistory from "./nps-call-history";

export type NpsDashboardMode = "personal" | "team" | "organization";

interface NpsSaleScoreCardProps {
  mode: NpsDashboardMode;
}

const MODE_SCOPE = {
  personal: "own",
  team: "team",
  organization: "all",
} as const;

export default function NpsSaleScoreCard({ mode }: NpsSaleScoreCardProps) {
  const { user } = useAuth();
  const access = getNpsDashboardAccess(user);
  const allowed = access.canRead && access.scope === MODE_SCOPE[mode];
  const viewerKey = user?.crm_user_id ?? user?.email ?? user?.user ?? "";
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [saleFilter, setSaleFilter] = useState("");
  const filters = {
    ...(fromDate ? { from_date: fromDate } : {}),
    ...(toDate ? { to_date: toDate } : {}),
  };
  const summaryQuery = useNpsSaleSummaryQuery(filters, allowed, viewerKey);
  const historyQuery = useNpsHistoryQuery(
    {
      ...filters,
      ...(saleFilter ? { sale: saleFilter } : {}),
      limit: 10,
    },
    allowed,
    viewerKey,
  );

  if (!allowed) return null;

  const summary = summaryQuery.data;
  const records = [...(summary?.records ?? [])].sort(
    (left, right) =>
      right.average_normalized_score - left.average_normalized_score,
  );
  const saleNameCounts = records.reduce((counts, record) => {
    counts.set(record.sale, (counts.get(record.sale) ?? 0) + 1);
    return counts;
  }, new Map<string, number>());
  const historyItems = historyQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const title =
    mode === "personal"
      ? "Chất lượng cuộc gọi của tôi"
      : mode === "team"
        ? "Chất lượng cuộc gọi trong team"
        : "Chất lượng cuộc gọi toàn hệ thống";

  return (
    <Card className="min-w-0 overflow-hidden p-0">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-card-border bg-background-gray-secondary/40 p-5 sm:p-6">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
            Chất lượng cuộc gọi · NPS
          </p>
          <h2 className="mt-1 text-lg font-semibold text-text-primary">{title}</h2>
          <p className="mt-1 max-w-2xl text-sm leading-5 text-text-secondary">
            Trung bình bốn tiêu chí cho các cuộc gọi đã chấm hợp lệ. Thang điểm
            chính 1–10.
          </p>
        </div>
        {summary ? (
          <Badge color="primary" size="sm">
            {summary.total_points} cuộc gọi có điểm
          </Badge>
        ) : null}
      </header>

      <div className="space-y-5 p-5 sm:p-6">
        <div className="grid min-w-0 gap-3 sm:grid-cols-3">
          <Metric
            label="Điểm trung bình"
            value={summary?.average_score?.toFixed(2) ?? "—"}
            suffix={summary?.average_score === null || !summary ? "" : "/10"}
            busy={summaryQuery.isPending}
          />
          <Metric
            label="Quy đổi"
            value={summary?.average_normalized_score?.toFixed(1) ?? "—"}
            suffix={
              summary?.average_normalized_score === null || !summary
                ? ""
                : "/100"
            }
            busy={summaryQuery.isPending}
          />
          <Metric
            label="Cuộc gọi đã chấm"
            value={summary ? summary.total_points.toLocaleString("vi-VN") : "—"}
            busy={summaryQuery.isPending}
          />
        </div>

        {summaryQuery.isError ? (
          <div
            className="rounded-lg bg-badge-error-background p-3 text-sm text-error-600"
            role="alert"
          >
            <p>Không thể tải tổng hợp chất lượng cuộc gọi. {summaryQuery.error.message}</p>
            <Button
              type="button"
              appearance="ghost"
              size="sm"
              className="mt-2 min-h-10 px-0"
              onPress={() => void summaryQuery.refetch()}
            >
              Thử lại
            </Button>
          </div>
        ) : null}

        {mode !== "personal" ? (
          <section aria-labelledby="nps-breakdown-heading">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h3 id="nps-breakdown-heading" className="text-sm font-semibold text-text-primary">
                  Điểm theo Sale
                </h3>
                <p className="mt-1 text-xs text-text-tertiary">Tổng điểm chung được tính theo số cuộc gọi.</p>
              </div>
            </div>
            {summaryQuery.isPending ? (
              <div className="mt-3 space-y-2" aria-busy="true">
                <Skeleton className="h-11 rounded-lg" />
                <Skeleton className="h-11 rounded-lg" />
              </div>
            ) : records.length ? (
              <ul className="mt-3 divide-y divide-card-border/70 rounded-lg border border-card-border px-3">
                {records.map((record) => (
                  <li key={record.sale_user} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text-primary">{record.sale}</p>
                      {saleNameCounts.get(record.sale)! > 1 ? (
                        <p className="mt-0.5 truncate text-xs text-text-tertiary">{record.sale_user}</p>
                      ) : null}
                      <p className="mt-0.5 text-xs text-text-tertiary">{record.count.toLocaleString("vi-VN")} cuộc gọi có điểm</p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-text-primary">
                      {record.average_score.toFixed(2)}<span className="font-normal text-text-tertiary">/10</span>
                    </p>
                  </li>
                ))}
              </ul>
            ) : !summaryQuery.isError ? (
              <p className="mt-3 rounded-lg border border-dashed border-card-border p-4 text-sm text-text-secondary">
                Chưa có cuộc gọi nào được chấm trong phạm vi này.
              </p>
            ) : null}
          </section>
        ) : null}

        <section aria-labelledby="nps-history-heading" className="border-t border-card-border pt-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 id="nps-history-heading" className="text-sm font-semibold text-text-primary">Lịch sử cuộc gọi đã chấm</h3>
              <p className="mt-1 text-xs text-text-tertiary">Ngày giờ hiển thị theo Asia/Ho_Chi_Minh.</p>
            </div>
            <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-2">
              <label className="grid gap-1 text-xs font-medium text-text-secondary">
                Từ ngày
                <input
                  aria-label="NPS từ ngày"
                  type="date"
                  value={fromDate}
                  onChange={(event) => setFromDate(event.currentTarget.value)}
                  className="min-h-10 rounded-lg border border-card-border bg-card-background px-3 text-sm text-text-primary outline-none focus:ring-2 focus:ring-brand-500"
                />
              </label>
              <label className="grid gap-1 text-xs font-medium text-text-secondary">
                Đến ngày
                <input
                  aria-label="NPS đến ngày"
                  type="date"
                  value={toDate}
                  onChange={(event) => setToDate(event.currentTarget.value)}
                  className="min-h-10 rounded-lg border border-card-border bg-card-background px-3 text-sm text-text-primary outline-none focus:ring-2 focus:ring-brand-500"
                />
              </label>
            </div>
          </div>

          {mode !== "personal" ? (
            <label className="mt-3 grid max-w-sm gap-1 text-xs font-medium text-text-secondary">
              Sale
              <select
                aria-label="Lọc lịch sử theo Sale"
                value={saleFilter}
                onChange={(event) => setSaleFilter(event.currentTarget.value)}
                className="min-h-10 rounded-lg border border-card-border bg-card-background px-3 text-sm text-text-primary outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Tất cả Sale trong phạm vi</option>
                {records.map((record) => (
                  <option key={record.sale_user} value={record.sale_user}>
                    {saleNameCounts.get(record.sale)! > 1
                      ? `${record.sale} · ${record.sale_user}`
                      : record.sale}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <NpsCallHistory
            items={historyItems}
            isPending={historyQuery.isPending}
            isError={historyQuery.isError}
            errorMessage={historyQuery.error?.message}
            hasMore={historyQuery.hasNextPage}
            isLoadingMore={historyQuery.isFetchingNextPage}
            onRetry={() => void historyQuery.refetch()}
            onLoadMore={() => void historyQuery.fetchNextPage()}
          />
        </section>
      </div>
    </Card>
  );
}

function Metric({
  label,
  value,
  suffix,
  busy,
}: {
  label: string;
  value: string;
  suffix?: string;
  busy: boolean;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-card-border bg-card-background p-3">
      <p className="text-xs text-text-tertiary">{label}</p>
      {busy ? (
        <Skeleton className="mt-2 h-7 w-24 rounded-md" aria-busy="true" />
      ) : (
        <p className="mt-1 truncate text-xl font-semibold tabular-nums text-text-primary">
          {value}<span className="ml-1 text-xs font-normal text-text-tertiary">{suffix}</span>
        </p>
      )}
    </div>
  );
}
