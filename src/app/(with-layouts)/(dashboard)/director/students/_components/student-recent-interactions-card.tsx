"use client";

import { ClockThree } from "@tailgrids/icons";
import { Card } from "@/components/tailgrids/core/card";
import { AnalysisRecentChangesList } from "@/components/analysis-runs/analysis-report-signal-lists";
import { useInteractionFeedQuery } from "@/hooks/use-interaction-intelligence-queries";
import type { AnalysisRecentChange } from "@/services/api/analysis-runs";
import { formatDateTime } from "@/utils/format-date";
import StudentAICardHeader from "./student-ai-card-header";
import StudentCardEmptyState from "./student-card-empty-state";
import {
  getChannelLabel,
  getInteractionActivityTitle,
} from "./student-interaction-utils";

interface StudentRecentInteractionsCardProps {
  studentId?: string | null;
  recentChanges?: AnalysisRecentChange[];
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export default function StudentRecentInteractionsCard({
  studentId,
  recentChanges = [],
  isRefreshing,
  onRefresh,
}: StudentRecentInteractionsCardProps) {
  return (
    <Card className="min-w-0 overflow-hidden border border-card-border p-5 lg:p-6">
      <StudentAICardHeader
        description="Tóm tắt các điểm chạm inbound và outbound gần nhất."
        icon={<ClockThree size={18} aria-hidden="true" />}
        title="Nhật ký tương tác gần đây"
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
      />

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="flex flex-col rounded-xl border border-card-border/70 bg-background-soft-50/50 p-4 sm:p-5 dark:bg-card-background/40">
          <div className="flex items-center justify-between border-b border-card-border/60 pb-3">
            <h4 className="text-sm font-semibold text-text-primary">
              Kênh tiếp cận tuyển sinh (Inbound)
            </h4>
          </div>
          {recentChanges.length > 0 ? (
            <div className="mt-3">
              <AnalysisRecentChangesList
                items={recentChanges}
                variant="plain"
              />
            </div>
          ) : (
            <StudentCardEmptyState
              message="Chưa có dữ liệu."
              className="py-6"
            />
          )}
        </div>

        <div className="flex flex-col rounded-xl border border-card-border/70 bg-background-soft-50/50 p-4 sm:p-5 dark:bg-card-background/40">
          <div className="flex items-center justify-between border-b border-card-border/60 pb-3">
            <h4 className="text-sm font-semibold text-text-primary">
              3 hoạt động gần nhất (Outbound)
            </h4>
          </div>
          <StudentOutboundActivityList studentId={studentId} />
        </div>
      </div>
    </Card>
  );
}

function StudentOutboundActivityList({
  studentId,
}: {
  studentId?: string | null;
}) {
  const normalizedStudentId = studentId?.trim() ?? "";
  const query = useInteractionFeedQuery(
    normalizedStudentId,
    { direction: "outbound", limit: 3 },
    Boolean(normalizedStudentId),
  );
  const items =
    query.data?.pages
      .flatMap((page) => page.items)
      .filter((item) => item.direction?.toLowerCase() === "outbound")
      .sort(
        (left, right) =>
          parseActivityTimestamp(right.occurred_at) -
          parseActivityTimestamp(left.occurred_at),
      )
      .slice(0, 3) ?? [];

  if (query.isPending && items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-text-tertiary">
        Đang tải hoạt động...
      </p>
    );
  }

  if (query.isError && items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-error-600">
        Không thể tải hoạt động outbound.
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <StudentCardEmptyState message="Chưa có dữ liệu." className="py-6" />
    );
  }

  return (
    <ul className="mt-3 divide-y divide-card-border">
      {items.map((item) => (
        <li key={item.id} className="min-w-0 py-3 first:pt-3 last:pb-0">
          <div className="flex items-start justify-between gap-3">
            <p className="min-w-0 text-sm font-semibold text-text-primary text-pretty">
              {getInteractionActivityTitle(item)}
            </p>
            {item.occurred_at && (
              <time
                dateTime={item.occurred_at}
                className="shrink-0 text-xs text-text-tertiary"
              >
                {formatDateTime(item.occurred_at)}
              </time>
            )}
          </div>
          {item.channel && (
            <p className="mt-1 text-xs text-text-tertiary">
              {getChannelLabel(item.channel)}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}

function parseActivityTimestamp(value?: string | null) {
  const timestamp = value ? Date.parse(value) : Number.NaN;
  return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
}
