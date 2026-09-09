"use client";

import { ArrowLeft, ArrowRight, Close, Search1 } from "@tailgrids/icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Label } from "react-aria-components";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import { Input } from "@/components/tailgrids/core/input";
import { TextField } from "@/components/tailgrids/core/text-field";
import { useLeadAssignmentHistoryQuery } from "@/hooks/use-lead-assignment-batch-queries";
import type { LeadAssignmentHistoryItem } from "@/services/api/lead-sale";
import { cn } from "@/utils/cn";
import AssignmentHistoryItemDrawer from "../../_shared/lead-assignment-batch/assignment-history-item-drawer";
import {
  assignmentReasonLabel,
  formatCount,
  formatDate,
  itemStatusColors,
  itemStatusLabels,
} from "../../_shared/lead-assignment-batch/batch-assignment-mappings";

const statusTabs = [
  { id: "all", label: "Tất cả" },
  { id: "manual_review", label: "Cần kiểm tra" },
  { id: "failed", label: "Lỗi xử lý" },
  { id: "deferred", label: "Tạm hoãn" },
  { id: "pending", label: "Chờ phân công" },
  { id: "assigned", label: "Đã phân công" },
  { id: "skipped", label: "Đã bỏ qua" },
] as const;

type HistoryStatus = (typeof statusTabs)[number]["id"];

function needsAttention(item: LeadAssignmentHistoryItem): boolean {
  return ["deferred", "manual_review", "failed"].includes(item.status);
}

function HistoryRow({
  item,
  onInspect,
}: {
  item: LeadAssignmentHistoryItem;
  onInspect: (item: LeadAssignmentHistoryItem) => void;
}) {
  return (
    <TableRow>
      <TableCell className="min-w-56">
        <div className="font-semibold text-text-primary">{item.studentName}</div>
        <div className="mt-0.5 text-xs text-text-tertiary">
          <span className="font-medium text-text-secondary">{item.leadCode ?? "Chưa có mã Lead"}</span>
        </div>
      </TableCell>
      <TableCell className="min-w-36 whitespace-nowrap text-sm text-text-secondary">
        {item.phone || "Chưa có số điện thoại"}
      </TableCell>
      <TableCell className="min-w-44">
        <div>{item.team || "Chưa tìm được Team"}</div>
        <div className="mt-0.5 text-xs text-text-tertiary">
          {item.ownerStaff || "Chưa có người phụ trách"}
        </div>
      </TableCell>
      <TableCell className="min-w-32">
        <Badge
          color={itemStatusColors[item.status]}
          className="whitespace-nowrap"
        >
          {itemStatusLabels[item.status]}
        </Badge>
      </TableCell>
      <TableCell className="min-w-64 text-sm font-normal text-text-secondary">
        {item.status === "assigned"
          ? "Đã phân công thành công."
          : assignmentReasonLabel(item)}
        {item.processingStatus === "CLOSED" && (
          <span className="mt-0.5 block text-xs text-text-tertiary">
            Hồ sơ đang đóng — mở lại trong phần xử lý.
          </span>
        )}
      </TableCell>
      <TableCell className="min-w-36 whitespace-nowrap text-sm text-text-secondary">
        {item.batchCreatedAt ? formatDate(item.batchCreatedAt) : "—"}
      </TableCell>
      <TableCell className="min-w-32 text-right">
        {needsAttention(item) ? (
          <Button appearance="outline" size="sm" onPress={() => onInspect(item)}>
            Xử lý
          </Button>
        ) : (
          <span className="text-xs text-text-tertiary">—</span>
        )}
      </TableCell>
    </TableRow>
  );
}

export default function AssignmentBatchHistory() {
  const searchParams = useSearchParams();
  const requestedStatus = searchParams.get("status");
  const initialStatus: HistoryStatus = statusTabs.some(
    (tab) => tab.id === requestedStatus,
  )
    ? (requestedStatus as HistoryStatus)
    : "all";
  const leadIds = useMemo(
    () =>
      (searchParams.get("leadIds") ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    [searchParams],
  );
  const [status, setStatus] = useState<HistoryStatus>(initialStatus);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [inspectedId, setInspectedId] = useState<string | null>(null);
  const autoOpenHandled = useRef(false);
  const { data, error, isLoading, isFetching } = useLeadAssignmentHistoryQuery({
    status,
    q: query,
    page,
    limit: 50,
    leadIds: leadIds.length ? leadIds : undefined,
  });

  function changeStatus(nextStatus: HistoryStatus) {
    setStatus(nextStatus);
    setPage(1);
  }

  function changeQuery(nextQuery: string) {
    setQuery(nextQuery);
    setPage(1);
  }

  const items = useMemo(() => data?.items ?? [], [data?.items]);
  const pagination = data?.pagination;
  useEffect(() => {
    if (
      autoOpenHandled.current ||
      searchParams.get("open") !== "1" ||
      !items.length
    ) {
      return;
    }
    autoOpenHandled.current = true;
    setInspectedId(`${items[0].batchId}:${items[0].id}`);
  }, [items, searchParams]);

  const inspectedItem =
    items.find((item) => `${item.batchId}:${item.id}` === inspectedId) ?? null;

  return (
    <section aria-label="Lịch sử phân công" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <TextField value={query} onChange={changeQuery} className="w-full sm:w-96">
          <Label className="sr-only">Tìm hồ sơ phân công</Label>
          <div className="relative">
            <Search1
              size={16}
              aria-hidden="true"
              className="pointer-events-none absolute top-3 left-3 text-text-tertiary"
            />
            <Input
              placeholder="Tìm tên, mã Lead, tỉnh, Team, người phụ trách…"
              className="h-10 w-full pr-8 pl-9 text-sm"
            />
            {query && (
              <Button
                iconOnly
                appearance="ghost"
                size="xs"
                aria-label="Xóa tìm kiếm"
                className="absolute top-1.5 right-1 text-text-tertiary"
                onPress={() => changeQuery("")}
              >
                <Close size={13} aria-hidden="true" />
              </Button>
            )}
          </div>
        </TextField>
        <p className="text-sm text-text-secondary" aria-live="polite">
          {pagination ? `${formatCount(pagination.total)} hồ sơ` : "Đang tải hồ sơ…"}
        </p>
      </div>

      <div
        className="flex flex-wrap gap-1.5"
        role="tablist"
        aria-label="Trạng thái hồ sơ"
      >
        {statusTabs.map((tab) => (
          <Button
            key={tab.id}
            appearance="ghost"
            size="sm"
            aria-pressed={status === tab.id}
            className={cn(
              "text-text-secondary",
              status === tab.id &&
                "bg-badge-primary-background text-badge-primary-text",
            )}
            onPress={() => changeStatus(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {error && (
        <Card className="border-badge-error-text/30 px-5 py-4 text-sm text-badge-error-text">
          Không thể tải lịch sử phân công: {error.message}
        </Card>
      )}

      <Card className="overflow-hidden p-0">
        <TableRoot className="text-sm">
          <TableHeader>
            <TableRow>
              <TableHead>Lead / Mã Lead</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>Team / Người phụ trách</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Lý do / kết quả</TableHead>
              <TableHead>Ngày phân công</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-text-tertiary">
                  Đang tải lịch sử phân công…
                </TableCell>
              </TableRow>
            ) : items.length ? (
              items.map((item) => (
                <HistoryRow
                  key={`${item.batchId}:${item.id}`}
                  item={item}
                  onInspect={(row) => setInspectedId(`${row.batchId}:${row.id}`)}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center">
                  <Search1
                    size={24}
                    className="mx-auto text-text-tertiary"
                    aria-hidden="true"
                  />
                  <p className="mt-3 text-sm font-medium text-text-primary">
                    Chưa có hồ sơ phù hợp
                  </p>
                  <p className="mt-1 text-xs text-text-tertiary">
                    Lịch sử được tổng hợp từ tất cả các lần phân công.
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </TableRoot>
        {pagination && pagination.total > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-card-border px-5 py-3">
            <p className="text-xs text-text-tertiary">
              {(page - 1) * pagination.pageSize + 1} đến {" "}
              {Math.min(page * pagination.pageSize, pagination.total)} trong {" "}
              {formatCount(pagination.total)} hồ sơ
            </p>
            <div className="flex items-center gap-2">
              <Button
                appearance="outline"
                size="sm"
                iconOnly
                aria-label="Trang trước"
                isDisabled={page <= 1 || isFetching}
                onPress={() => setPage(page - 1)}
              >
                <ArrowLeft size={16} aria-hidden="true" />
              </Button>
              <span className="min-w-12 text-center text-xs tabular-nums text-text-secondary">
                {page} / {Math.max(1, pagination.totalPages)}
              </span>
              <Button
                appearance="outline"
                size="sm"
                iconOnly
                aria-label="Trang sau"
                isDisabled={!pagination.hasNextPage || isFetching}
                onPress={() => setPage(page + 1)}
              >
                <ArrowRight size={16} aria-hidden="true" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {inspectedItem && (
        <AssignmentHistoryItemDrawer
          item={inspectedItem}
          onClose={() => setInspectedId(null)}
        />
      )}
    </section>
  );
}
