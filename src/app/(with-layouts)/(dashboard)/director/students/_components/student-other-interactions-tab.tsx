"use client";

import { useMemo } from "react";

import { useInteractionFeedQuery } from "@/hooks/use-interaction-intelligence-queries";
import type {
  InteractionSummary,
  InteractionType,
} from "@/services/api/interaction-intelligence";
import { formatDateTime } from "@/utils/format-date";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Skeleton } from "@/components/tailgrids/core/skeleton";
import { InfoCircle, RefreshCircle1Clockwise } from "@tailgrids/icons";

import {
  getChannelLabel,
  getDirectionLabel,
  getInteractionLabel,
  isOtherInteraction,
} from "./student-interaction-utils";

interface StudentOtherInteractionsTabProps {
  studentId: string;
  excludedInteractionIds?: string[];
  interactionTypes: InteractionType[];
}

export default function StudentOtherInteractionsTab({
  studentId,
  excludedInteractionIds = [],
  interactionTypes,
}: StudentOtherInteractionsTabProps) {
  const normalizedStudentId = studentId.trim();
  const feedQuery = useInteractionFeedQuery(
    normalizedStudentId,
    { limit: 100 },
    Boolean(normalizedStudentId),
  );
  const interactions = useMemo(
    () =>
      (feedQuery.data?.pages.flatMap((page) => page.items) ?? [])
        .filter(
          (interaction) =>
            !excludedInteractionIds.includes(interaction.id) &&
            isOtherInteraction(interaction),
        )
        .sort(
          (left, right) =>
            parseInteractionTimestamp(right.occurred_at) -
            parseInteractionTimestamp(left.occurred_at),
        ),
    [excludedInteractionIds, feedQuery.data?.pages],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-text-primary">
            Tương tác khác
          </h3>
          <p className="mt-1 text-xs text-text-tertiary">
            Các loại tương tác ngoài Zalo và cuộc gọi.
          </p>
        </div>
      </div>

      {feedQuery.isPending && interactions.length === 0 ? (
        <OtherInteractionsSkeleton />
      ) : feedQuery.isError && interactions.length === 0 ? (
        <div className="rounded-lg border border-error-500/30 bg-badge-error-background p-4 text-sm text-error-600">
          <div className="flex items-start gap-2">
            <InfoCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-medium">Không thể tải tương tác khác.</p>
              <p className="mt-1 text-xs">
                {feedQuery.error.message || "Vui lòng thử lại."}
              </p>
              <Button
                type="button"
                variant="danger"
                appearance="ghost"
                size="sm"
                className="mt-2 px-0"
                onPress={() => feedQuery.refetch()}
              >
                <RefreshCircle1Clockwise size={15} aria-hidden="true" />
                Thử lại
              </Button>
            </div>
          </div>
        </div>
      ) : interactions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-card-border px-4 py-8 text-center">
          <p className="text-sm font-medium text-text-primary">
            Chưa có tương tác khác
          </p>
          <p className="mt-1 text-xs text-text-tertiary">
            Tạo một tương tác thủ công để bổ sung vào lịch sử của học sinh.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-card-border rounded-xl border border-card-border">
          {interactions.map((interaction) => (
            <OtherInteractionRow
              key={interaction.id}
              interaction={interaction}
              catalog={interactionTypes}
            />
          ))}
        </div>
      )}

      {feedQuery.hasNextPage && (
        <Button
          type="button"
          appearance="outline"
          size="sm"
          className="w-full sm:w-auto"
          onPress={() => void feedQuery.fetchNextPage()}
          isDisabled={feedQuery.isFetchingNextPage}
        >
          {feedQuery.isFetchingNextPage ? "Đang tải…" : "Tải thêm"}
        </Button>
      )}
    </div>
  );
}

function OtherInteractionRow({
  interaction,
  catalog,
}: {
  interaction: InteractionSummary;
  catalog: InteractionType[];
}) {
  const catalogMap = useMemo(
    () => new Map(catalog.map((item) => [item.code, item])),
    [catalog],
  );
  const typeLabel = getInteractionLabel(interaction, catalogMap);

  return (
    <article className="min-w-0 p-4 first:rounded-t-xl last:rounded-b-xl hover:bg-background-gray-secondary/40">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="truncate text-sm font-semibold text-text-primary">
              {typeLabel}
            </h4>
            <Badge color="gray" size="sm">
              {interaction.interaction_type}
            </Badge>
          </div>
          {interaction.summary && (
            <p className="mt-1 line-clamp-2 text-sm leading-5 text-text-secondary">
              {interaction.summary}
            </p>
          )}
        </div>
        <time
          dateTime={interaction.occurred_at ?? undefined}
          className="shrink-0 text-xs text-text-tertiary"
        >
          {formatDateTime(interaction.occurred_at)}
        </time>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-text-tertiary">
        {interaction.channel && (
          <span>Kênh: {getChannelLabel(interaction.channel)}</span>
        )}
        {interaction.direction && (
          <span>Hướng: {getDirectionLabel(interaction.direction)}</span>
        )}
        {interaction.outcome && <span>Kết quả: {interaction.outcome}</span>}
      </div>
    </article>
  );
}

function OtherInteractionsSkeleton() {
  return (
    <div className="space-y-3" aria-label="Đang tải tương tác khác">
      {["first", "second", "third"].map((item) => (
        <div
          key={item}
          className="space-y-3 rounded-xl border border-card-border p-4"
        >
          <Skeleton className="h-4 w-2/5" />
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}

function parseInteractionTimestamp(value?: string | null): number {
  if (!value) return Number.NEGATIVE_INFINITY;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
}
