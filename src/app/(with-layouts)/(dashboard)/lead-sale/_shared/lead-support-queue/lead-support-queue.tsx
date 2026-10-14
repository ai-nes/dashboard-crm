"use client";

import { ArrowLeft, ArrowRight, Search1 } from "@tailgrids/icons";
import { useState } from "react";
import { Label } from "react-aria-components";

import { TableRowActions } from "@/components/common/table-row-actions";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { Input } from "@/components/tailgrids/core/input";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import { TextField } from "@/components/tailgrids/core/text-field";
import { useLeadSupportQueueQuery } from "@/hooks/use-lead-support-queue-queries";
import type { LeadSupportItem } from "@/services/api/lead-sale";
import { cn } from "@/utils/cn";

import LeadSupportDrawer from "./lead-support-drawer";
import {
  supportFilters,
  supportReasonColors,
  supportReasonDetail,
  supportReasonLabels,
  type SupportFilter,
} from "./lead-support-mappings";

const PAGE_SIZE = 20;

/** Shared campus queue where Sale and CTV Sale complete unowned leads. */
export default function LeadSupportQueue() {
  const [filter, setFilter] = useState<SupportFilter>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [inspected, setInspected] = useState<LeadSupportItem | null>(null);
  const { data, error, isLoading, isFetching } = useLeadSupportQueueQuery({
    page,
    limit: PAGE_SIZE,
    q: query,
    reason: filter === "all" ? undefined : filter,
  });
  const items = data?.items ?? [];
  const pagination = data?.pagination;
  const totalAll = data
    ? Object.values(data.counts).reduce((sum, value) => sum + value, 0)
    : 0;

  function changeFilter(next: SupportFilter) {
    setFilter(next);
    setPage(1);
  }

  return (
    <section aria-label="Lead cần bổ sung" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <TextField
          value={query}
          onChange={(value) => {
            setQuery(value);
            setPage(1);
          }}
          className="w-full sm:w-96"
        >
          <Label className="sr-only">Tìm Lead cần bổ sung</Label>
          <div className="relative">
            <Search1
              size={16}
              aria-hidden="true"
              className="pointer-events-none absolute top-3 left-3 text-text-tertiary"
            />
            <Input
              placeholder="Tìm tên, mã Lead, số điện thoại…"
              className="h-10 w-full pl-9 text-sm"
            />
          </div>
        </TextField>
        <p className="text-sm text-text-secondary" aria-live="polite">
          {pagination ? `${pagination.total} hồ sơ` : "Đang tải hồ sơ…"}
        </p>
      </div>

      <div
        className="flex flex-wrap gap-1.5"
        role="tablist"
        aria-label="Lý do cần bổ sung"
      >
        {supportFilters.map((id) => (
          <Button
            key={id}
            appearance="ghost"
            size="sm"
            aria-pressed={filter === id}
            className={cn(
              "text-text-secondary",
              filter === id &&
                "bg-badge-primary-background text-badge-primary-text",
            )}
            onPress={() => changeFilter(id)}
          >
            {id === "all" ? "Tất cả" : supportReasonLabels[id]}
            {data && (
              <span className="ml-1 tabular-nums text-text-tertiary">
                {id === "all" ? totalAll : data.counts[id]}
              </span>
            )}
          </Button>
        ))}
      </div>

      {error && (
        <Card className="border-badge-error-text/30 px-5 py-4 text-sm text-badge-error-text">
          Không thể tải danh sách: {error.message}
        </Card>
      )}

      <Card className="overflow-hidden p-0">
        <TableRoot className="text-sm">
          <TableHeader>
            <TableRow>
              <TableHead>Lead / Mã Lead</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>Tỉnh / Cơ sở</TableHead>
              <TableHead>Cần bổ sung</TableHead>
              <TableHead>Chi tiết</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-12 text-center text-text-tertiary"
                >
                  Đang tải danh sách…
                </TableCell>
              </TableRow>
            ) : items.length ? (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="min-w-52">
                    <p className="font-medium text-text-primary">
                      {item.studentName || "Chưa có tên"}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      {item.leadCode}
                    </p>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-text-secondary">
                    {item.phone || "—"}
                  </TableCell>
                  <TableCell className="min-w-44 text-text-secondary">
                    <p>{item.province?.name ?? "Chưa có tỉnh"}</p>
                    <p className="text-xs text-text-tertiary">
                      {item.campus?.name ?? "Chưa có cơ sở"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      size="sm"
                      color={supportReasonColors[item.reason]}
                      className="whitespace-nowrap"
                    >
                      {supportReasonLabels[item.reason]}
                    </Badge>
                  </TableCell>
                  <TableCell className="min-w-72 text-sm text-text-secondary">
                    {supportReasonDetail(item)}
                  </TableCell>
                  <TableCell className="text-right">
                    <TableRowActions
                      label={item.leadCode || item.studentName || "Lead"}
                      actions={[
                        {
                          id: "support",
                          label: "Bổ sung",
                          onAction: () => setInspected(item),
                        },
                      ]}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <p className="text-sm font-medium text-text-primary">
                    Không có Lead nào cần bổ sung
                  </p>
                  <p className="mt-1 text-xs text-text-tertiary">
                    Lead chưa có người phụ trách trong cơ sở của bạn sẽ hiện ở
                    đây khi thiếu dữ liệu.
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </TableRoot>
        {pagination && pagination.total > PAGE_SIZE && (
          <div className="flex items-center justify-end gap-2 border-t border-card-border px-5 py-3">
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
              {page} / {pagination.totalPages}
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
        )}
      </Card>

      {inspected && (
        <LeadSupportDrawer
          key={inspected.id}
          item={inspected}
          onClose={() => setInspected(null)}
        />
      )}
    </section>
  );
}
