"use client";

import { ChevronDown, InfoCircle } from "@tailgrids/icons";
import { useState } from "react";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "@/components/tailgrids/core/select";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import {
  SEGMENT_STATUS_BADGE_COLORS,
  SEGMENT_STATUS_LABELS,
} from "@/components/segments/segment-list-types";
import { useSegmentAnalysisQuery } from "@/hooks/use-segment-queries";
import type {
  SegmentAnalysisResponse,
  SegmentAnalysisSegment,
  SegmentOverlapCell,
  SegmentStatus,
} from "@/services/api/segments";
import { formatDate } from "@/utils/format-date";

import StudentCardEmptyState from "@/app/(with-layouts)/(dashboard)/director/students/_components/student-card-empty-state";

const STATUS_CARDS: Array<{
  key: SegmentStatus | "total";
  label: string;
}> = [
  { key: "total", label: "Tất cả" },
  { key: "active", label: SEGMENT_STATUS_LABELS.active },
  { key: "inactive", label: SEGMENT_STATUS_LABELS.inactive },
  { key: "archive", label: SEGMENT_STATUS_LABELS.archive },
  { key: "draft", label: SEGMENT_STATUS_LABELS.draft },
];

const STATUS_CARD_STYLES: Record<
  SegmentStatus | "total",
  { card: string; count: string }
> = {
  total: {
    card: "border-primary-100 bg-primary-50/35",
    count: "text-primary-500",
  },
  active: {
    card: "border-badge-success-icon-color bg-badge-success-background/45",
    count: "text-badge-success-text",
  },
  inactive: {
    card: "border-badge-neutral-icon-color bg-badge-neutral-background/50",
    count: "text-badge-neutral-text",
  },
  archive: {
    card: "border-badge-violet-icon-color bg-badge-violet-background/50",
    count: "text-badge-violet-text",
  },
  draft: {
    card: "border-badge-warning-icon-color bg-badge-warning-background/50",
    count: "text-badge-warning-text",
  },
};

interface SegmentAnalysisProps {
  enabled?: boolean;
  onViewSegments?: () => void;
}

export default function SegmentAnalysisEmptyState({
  enabled = true,
  onViewSegments,
}: SegmentAnalysisProps) {
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const analysisQuery = useSegmentAnalysisQuery(selectedCodes, enabled);

  if (!enabled) return null;

  if (analysisQuery.isLoading) {
    return <AnalysisState message="Đang tải dữ liệu phân tích segment…" />;
  }

  if (analysisQuery.error) {
    return (
      <AnalysisState
        message={analysisQuery.error.message}
        isError
        onRetry={() => void analysisQuery.refetch()}
      />
    );
  }

  if (!analysisQuery.data) {
    return <AnalysisState message="Chưa có dữ liệu phân tích segment." />;
  }

  return (
    <SegmentAnalysisContent
      data={analysisQuery.data}
      selectedCodes={selectedCodes}
      isFetching={analysisQuery.isFetching}
      onSelectedCodesChange={setSelectedCodes}
      onViewSegments={onViewSegments}
    />
  );
}

function SegmentAnalysisContent({
  data,
  selectedCodes,
  isFetching,
  onSelectedCodesChange,
  onViewSegments,
}: {
  data: SegmentAnalysisResponse;
  selectedCodes: string[];
  isFetching: boolean;
  onSelectedCodesChange: (codes: string[]) => void;
  onViewSegments?: () => void;
}) {
  return (
    <div className="space-y-5">
      <section aria-labelledby="segment-usage-heading">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2
            id="segment-usage-heading"
            className="text-xl leading-7 font-semibold tracking-[-0.2px] text-text-primary"
          >
            {data.summary.active} segment đang được sử dụng
          </h2>
          {isFetching && (
            <span className="text-xs text-text-tertiary" role="status">
              Đang cập nhật…
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {STATUS_CARDS.map((status) => {
            const count = data.summary[status.key];

            return (
              <SegmentUsageCard
                key={status.key}
                label={status.label}
                count={count}
                tone={status.key}
                onViewSegments={onViewSegments}
              />
            );
          })}
        </div>
      </section>

      <Card className="min-h-[34rem] p-0">
        <div className="flex flex-col gap-4 border-b border-card-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <h2 className="flex items-center gap-2 text-xl leading-7 font-semibold tracking-[-0.2px] text-text-primary">
            Segment overlap
            <InfoCircle
              size={16}
              className="text-text-tertiary"
              aria-hidden="true"
            />
          </h2>
          <SegmentPicker
            segments={data.segments}
            selectedCodes={selectedCodes}
            onChange={onSelectedCodesChange}
          />
        </div>

        {data.selected_segments.length === 0 ? (
          <StudentCardEmptyState
            message="Chọn segment để bắt đầu."
            className="min-h-[27rem]"
          />
        ) : (
          <SegmentOverlapMatrix
            segments={data.selected_segments}
            cells={data.overlap.cells}
          />
        )}
      </Card>

      <Card className="overflow-hidden p-5 sm:p-6">
        <h2 className="mb-5 flex items-center gap-2 text-xl leading-7 font-semibold tracking-[-0.2px] text-text-primary">
          Segment cần chú ý
          <InfoCircle
            size={16}
            className="text-text-tertiary"
            aria-hidden="true"
          />
        </h2>
        <SegmentAttentionTable segments={data.attention} />
      </Card>
    </div>
  );
}

function SegmentUsageCard({
  label,
  count,
  tone,
  onViewSegments,
}: {
  label: string;
  count: number;
  tone: SegmentStatus | "total";
  onViewSegments?: () => void;
}) {
  const style = STATUS_CARD_STYLES[tone];

  return (
    <Card className={`flex min-h-52 flex-col p-5 sm:p-6 ${style.card}`}>
      <h3 className="flex items-center gap-1.5 text-base font-semibold text-text-primary">
        {label}
        <InfoCircle
          size={15}
          className="text-text-tertiary"
          aria-hidden="true"
        />
      </h3>
      <p
        className={`mt-3 text-4xl leading-none font-semibold tracking-[-1px] ${style.count}`}
      >
        {count}
      </p>
      <p className="mt-3 text-sm text-text-secondary">segment</p>
      <Button
        variant="primary"
        appearance="outline"
        size="sm"
        isDisabled={count === 0 || !onViewSegments}
        onPress={onViewSegments}
        className="mt-auto w-fit"
      >
        Xem segments
      </Button>
    </Card>
  );
}

function SegmentPicker({
  segments,
  selectedCodes,
  onChange,
}: {
  segments: SegmentAnalysisSegment[];
  selectedCodes: string[];
  onChange: (codes: string[]) => void;
}) {
  return (
    <Select
      selectionMode="multiple"
      value={selectedCodes}
      onChange={(value) => onChange((value as string[]).slice(0, 5))}
      isDisabled={segments.length === 0}
      className="w-full sm:w-auto sm:min-w-64"
      aria-label="Chọn tối đa 5 segment để phân tích overlap"
    >
      <SelectLabel className="sr-only">
        Chọn segment để phân tích overlap
      </SelectLabel>
      <SelectTrigger className="h-10 w-full border-0 bg-transparent px-0 text-sm text-text-secondary shadow-none hover:bg-transparent sm:min-w-64">
        <span className="truncate">
          {selectedCodes.length > 0
            ? `Đã chọn ${selectedCodes.length}/5 segment`
            : "Chọn segment (tối đa 5)"}
        </span>
        <SelectIndicator>
          <ChevronDown size={16} aria-hidden="true" />
        </SelectIndicator>
      </SelectTrigger>
      <SelectContent className="max-h-72 min-w-(--trigger-width)">
        {segments.map((segment) => {
          const isSelected = selectedCodes.includes(segment.segment_code);
          const isLimitReached = selectedCodes.length >= 5 && !isSelected;

          return (
            <SelectItem
              key={segment.segment_code}
              id={segment.segment_code}
              textValue={segment.title}
              isDisabled={isLimitReached}
            >
              <span className="flex min-w-0 flex-col py-1">
                <span className="truncate text-text-primary">
                  {segment.title}
                </span>
                <span className="text-xs text-text-tertiary">
                  {segment.member_count} đối tượng · {segment.segment_code}
                </span>
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

function SegmentOverlapMatrix({
  segments,
  cells,
}: {
  segments: SegmentAnalysisSegment[];
  cells: SegmentOverlapCell[];
}) {
  const cellMap = new Map(
    cells.map((cell) => [
      `${cell.row_segment_code}:${cell.column_segment_code}`,
      cell.count,
    ]),
  );
  const maxCount = Math.max(...cells.map((cell) => cell.count), 1);

  return (
    <div className="overflow-x-auto p-5 sm:p-6">
      <TableRoot aria-label="Ma trận giao nhau giữa các segment">
        <TableHeader>
          <TableRow>
            <TableHead className="sticky left-0 min-w-44 bg-card-background">
              Segment
            </TableHead>
            {segments.map((segment) => (
              <TableHead
                key={segment.segment_code}
                className="min-w-32 text-center"
                title={segment.title}
              >
                <span className="block max-w-32 truncate" title={segment.title}>
                  {segment.title}
                </span>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {segments.map((rowSegment) => (
            <TableRow key={rowSegment.segment_code}>
              <TableHead className="sticky left-0 bg-card-background text-text-primary">
                <span
                  className="block max-w-44 truncate"
                  title={rowSegment.title}
                >
                  {rowSegment.title}
                </span>
              </TableHead>
              {segments.map((columnSegment) => {
                const count =
                  cellMap.get(
                    `${rowSegment.segment_code}:${columnSegment.segment_code}`,
                  ) ?? 0;

                return (
                  <TableCell
                    key={columnSegment.segment_code}
                    className={`text-center tabular-nums ${getOverlapCellClass(
                      count,
                      maxCount,
                      rowSegment.segment_code === columnSegment.segment_code,
                    )}`}
                  >
                    {count}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </TableRoot>
    </div>
  );
}

function getOverlapCellClass(
  count: number,
  maxCount: number,
  isDiagonal: boolean,
): string {
  if (isDiagonal) {
    return "bg-primary-50 text-primary-500 font-semibold";
  }
  if (count === 0) {
    return "text-text-tertiary";
  }

  const ratio = count / maxCount;
  if (ratio >= 0.67) {
    return "bg-badge-success-background text-badge-success-text font-semibold";
  }
  if (ratio >= 0.34) {
    return "bg-badge-sky-background text-badge-sky-text font-semibold";
  }
  return "bg-primary-50/60 text-primary-500 font-semibold";
}

function SegmentAttentionTable({
  segments,
}: {
  segments: SegmentAnalysisSegment[];
}) {
  if (segments.length === 0) {
    return (
      <div className="rounded-xl border border-card-border bg-background-gray-secondary p-6 text-center text-sm text-text-secondary">
        Không có segment cần chú ý.
      </div>
    );
  }

  return (
    <TableRoot aria-label="Danh sách segment cần chú ý">
      <TableHeader>
        <TableRow>
          <TableHead>Tên segment</TableHead>
          <TableHead>Thay đổi 7 ngày</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead>Đối tượng</TableHead>
          <TableHead>Cập nhật gần nhất</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {segments.map((segment) => (
          <TableRow key={segment.segment_code}>
            <TableCell>
              <div className="min-w-40">
                <p className="font-semibold text-text-primary">
                  {segment.title}
                </p>
                <p className="mt-1 text-xs text-text-tertiary">
                  {segment.segment_code}
                </p>
              </div>
            </TableCell>
            <TableCell className="tabular-nums">
              {formatMemberChange(segment.member_change_7d)}
            </TableCell>
            <TableCell>
              <Badge color={SEGMENT_STATUS_BADGE_COLORS[segment.status]}>
                {SEGMENT_STATUS_LABELS[segment.status]}
              </Badge>
            </TableCell>
            <TableCell className="tabular-nums">
              {segment.member_count}
            </TableCell>
            <TableCell>{formatDate(segment.modified, "—")}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </TableRoot>
  );
}

function formatMemberChange(value: number | null): string {
  if (value === null) return "—";
  return value > 0 ? `+${value}` : String(value);
}

function AnalysisState({
  message,
  isError = false,
  onRetry,
}: {
  message: string;
  isError?: boolean;
  onRetry?: () => void;
}) {
  return (
    <section
      role={isError ? "alert" : "status"}
      className={
        isError
          ? "rounded-2xl border border-badge-error-icon-color bg-badge-error-background p-8 text-center"
          : "rounded-2xl border border-card-border bg-card-background p-8 text-center text-sm text-text-secondary"
      }
    >
      <p className={isError ? "text-sm text-badge-error-text" : undefined}>
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          className="mt-4 text-sm font-semibold text-primary-500 hover:underline"
          onClick={onRetry}
        >
          Thử lại
        </button>
      )}
    </section>
  );
}
