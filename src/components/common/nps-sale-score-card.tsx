"use client";

import { useState } from "react";
import { ChevronDown } from "@tailgrids/icons";

import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/tailgrids/core/collapsible";
import { Skeleton } from "@/components/tailgrids/core/skeleton";
import { useAuth } from "@/components/common/auth/auth-provider";
import { getNpsDashboardAccess } from "@/components/common/auth/permissions";
import { DatePickerField } from "@/components/common/date-picker-field";
import {
  useNpsHistoryQuery,
  useNpsSaleSummaryQuery,
} from "@/hooks/use-interaction-intelligence-queries";
import NpsCallHistory from "./nps-call-history";
import NpsHistoryFilters from "./nps-history-filters";

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
  const historyItems =
    historyQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const title =
    mode === "personal"
      ? "Chất lượng cuộc gọi của tôi"
      : mode === "team"
        ? "Chất lượng cuộc gọi trong team"
        : "Chất lượng cuộc gọi toàn hệ thống";

  return (
    <Card className="min-w-0 overflow-hidden p-0">
      <header className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-text-primary">{title}</h2>
          <p className="mt-1 text-sm text-text-secondary">
            NPS · Trung bình 4 tiêu chí · Thang điểm 1–10
          </p>
          {fromDate || toDate ? (
            <p className="mt-1 text-xs text-text-secondary">
              {fromDate
                ? `Từ ${fromDate.split("-").reverse().join("/")}`
                : "Từ đầu"}
              {" · "}
              {toDate
                ? `Đến ${toDate.split("-").reverse().join("/")}`
                : "Đến nay"}
            </p>
          ) : null}
        </div>
        <dl className="grid min-w-0 grid-cols-3 gap-3 lg:w-[28rem] lg:shrink-0 lg:gap-6">
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
        </dl>
      </header>

      {summaryQuery.isError ? (
        <div
          className="mx-4 mb-4 rounded-lg bg-badge-error-background p-3 text-sm text-error-600 sm:mx-5"
          role="alert"
        >
          <p>
            Không thể tải tổng hợp chất lượng cuộc gọi.{" "}
            {summaryQuery.error.message}
          </p>
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

      {!summaryQuery.isPending &&
      !summaryQuery.isError &&
      summary?.total_points === 0 ? (
        <p className="px-4 pb-4 text-sm text-text-secondary sm:px-5">
          Chưa có cuộc gọi nào được chấm trong phạm vi này.
        </p>
      ) : null}

      <Collapsible className="max-w-none rounded-none border-0 border-t border-card-border bg-transparent data-expanded:pb-0 sm:data-expanded:pb-0">
        <CollapsibleTrigger className="min-h-11 px-4 py-3 text-sm font-medium text-text-secondary hover:bg-background-gray-secondary/40 group-data-expanded:font-medium sm:px-5 sm:py-3">
          {mode === "personal"
            ? "Xem lịch sử cuộc gọi"
            : "Điểm theo Sale & lịch sử"}
          <ChevronDown
            size={16}
            aria-hidden="true"
            className="shrink-0 transition-transform duration-200 group-data-expanded:rotate-180 motion-reduce:transition-none"
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="px-4 text-text-primary sm:px-5">
          <div className="space-y-4 pb-4 pt-1 sm:pb-5">
            {mode !== "personal" ? (
              <section aria-labelledby="nps-breakdown-heading">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <h3
                      id="nps-breakdown-heading"
                      className="text-sm font-semibold text-text-primary"
                    >
                      Điểm theo Sale
                    </h3>
                    <p className="mt-1 text-xs text-text-tertiary">
                      Tổng điểm chung được tính theo số cuộc gọi.
                    </p>
                  </div>
                </div>
                {summaryQuery.isPending ? (
                  <div className="mt-3 space-y-2" aria-busy="true">
                    <Skeleton className="h-11 rounded-lg" />
                    <Skeleton className="h-11 rounded-lg" />
                  </div>
                ) : records.length ? (
                  <ul className="mt-2 divide-y divide-card-border/70">
                    {records.map((record) => (
                      <li
                        key={record.sale_user}
                        className="flex flex-wrap items-center justify-between gap-3 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-text-primary">
                            {record.sale}
                          </p>
                          {saleNameCounts.get(record.sale)! > 1 ? (
                            <p className="mt-0.5 truncate text-xs text-text-tertiary">
                              {record.sale_user}
                            </p>
                          ) : null}
                          <p className="mt-0.5 text-xs text-text-tertiary">
                            {record.count.toLocaleString("vi-VN")} cuộc gọi có
                            điểm
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold text-text-primary">
                          {record.average_score.toFixed(2)}
                          <span className="font-normal text-text-tertiary">
                            /10
                          </span>
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : !summaryQuery.isError ? (
                  <p className="mt-2 text-sm text-text-secondary">
                    Chưa có cuộc gọi nào được chấm trong phạm vi này.
                  </p>
                ) : null}
              </section>
            ) : null}

            <section
              aria-labelledby="nps-history-heading"
              className={
                mode !== "personal"
                  ? "border-t border-card-border pt-4"
                  : undefined
              }
            >
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h3
                    id="nps-history-heading"
                    className="text-sm font-semibold text-text-primary"
                  >
                    Lịch sử cuộc gọi đã chấm
                  </h3>
                  <p className="mt-1 text-xs text-text-tertiary">
                    Ngày giờ hiển thị theo Asia/Ho_Chi_Minh.
                  </p>
                </div>
                <NpsHistoryFilters
                  activeCount={
                    [fromDate, toDate, saleFilter].filter(Boolean).length
                  }
                  onClear={() => {
                    setFromDate("");
                    setToDate("");
                    setSaleFilter("");
                  }}
                >
                  <div className="grid min-w-0 grid-cols-2 gap-3">
                    <div className="grid min-w-0 gap-1 text-xs font-medium text-text-secondary">
                      <span>Từ ngày</span>
                      <DatePickerField
                        ariaLabel="NPS từ ngày"
                        value={fromDate}
                        onChange={setFromDate}
                        className="h-11 min-w-0 md:h-10"
                      />
                    </div>
                    <div className="grid min-w-0 gap-1 text-xs font-medium text-text-secondary">
                      <span>Đến ngày</span>
                      <DatePickerField
                        ariaLabel="NPS đến ngày"
                        value={toDate}
                        onChange={setToDate}
                        className="h-11 min-w-0 md:h-10"
                      />
                    </div>
                  </div>
                  {mode !== "personal" ? (
                    <label className="grid gap-1 text-xs font-medium text-text-secondary">
                      Sale
                      <select
                        aria-label="Lọc lịch sử theo Sale"
                        value={saleFilter}
                        onChange={(event) =>
                          setSaleFilter(event.currentTarget.value)
                        }
                        className="min-h-11 w-full min-w-0 rounded-lg md:min-h-10 border border-card-border bg-card-background px-3 text-sm text-text-primary outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="">Tất cả Sale trong phạm vi</option>
                        {records.map((record) => (
                          <option
                            key={record.sale_user}
                            value={record.sale_user}
                          >
                            {saleNameCounts.get(record.sale)! > 1
                              ? `${record.sale} · ${record.sale_user}`
                              : record.sale}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : null}
                </NpsHistoryFilters>
              </div>

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
        </CollapsibleContent>
      </Collapsible>
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
    <div className="min-w-0">
      <dt className="min-h-8 text-xs text-text-secondary sm:min-h-0">
        {label}
      </dt>
      {busy ? (
        <dd className="mt-1" aria-busy="true">
          <Skeleton className="h-7 w-16 max-w-full rounded-md" />
        </dd>
      ) : (
        <dd className="mt-1 break-words text-xl font-semibold tabular-nums text-text-primary">
          {value}
          <span className="ml-1 text-xs font-normal text-text-secondary">
            {suffix}
          </span>
        </dd>
      )}
    </div>
  );
}
