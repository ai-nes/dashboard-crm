"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { toast } from "sonner";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import { getSegmentListColumns } from "./segment-list-columns";
import { useSegmentData } from "./segment-data-provider";
import { SegmentListToolbar } from "./segment-list-toolbar";
import {
  SEGMENT_STATUS_LABELS,
  type SegmentStatus,
} from "./segment-list-types";

const normalizeSearch = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();

export function SegmentList({ detailBaseHref }: { detailBaseHref: string }) {
  const { segments, setSegments } = useSegmentData();
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const columns = useMemo(
    () =>
      getSegmentListColumns({
        detailBaseHref,
        onStatusChange: (segment, status: SegmentStatus) => {
          setSegments((current) =>
            current.map((item) =>
              item.id === segment.id
                ? { ...item, status, updatedAt: new Date().toISOString() }
                : item,
            ),
          );
          toast.success(
            `Đã chuyển trạng thái segment sang ${SEGMENT_STATUS_LABELS[status]}`,
          );
        },
      }),
    [detailBaseHref, setSegments],
  );
  const table = useReactTable({
    data: segments,
    columns,
    state: { globalFilter, columnFilters },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    globalFilterFn: (row, columnId, value: string) =>
      normalizeSearch(String(row.getValue(columnId))).includes(
        normalizeSearch(value.trim()),
      ),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getRowId: (row) => row.id,
  });

  return (
    <section
      aria-label="Danh sách segments"
      className="overflow-hidden rounded-2xl border border-card-border bg-card-background shadow-xs"
    >
      <SegmentListToolbar table={table}>
        <TableRoot
          fullBleed
          className="border-0"
          aria-label="Danh sách segments"
        >
          <TableHeader className="bg-background-gray-secondary">
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    scope="col"
                    className="whitespace-nowrap"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="hover:bg-background-gray-secondary_alt"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="py-5 text-sm font-normal text-text-secondary"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {table.getRowModel().rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-16 text-center text-sm text-text-tertiary"
                >
                  {segments.length === 0
                    ? "Chưa có segment nào. Tạo segment để bắt đầu."
                    : "Không tìm thấy segment phù hợp. Thử từ khóa hoặc trạng thái khác."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </TableRoot>
      </SegmentListToolbar>
    </section>
  );
}
