"use client";

import { useState, type ReactNode } from "react";
import { Search1 } from "@tailgrids/icons";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/tailgrids/core/input-group";
import { Pagination } from "@/components/tailgrids/core/pagination";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import StudentCardEmptyState from "@/app/(with-layouts)/(dashboard)/director/students/_components/student-card-empty-state";
import { segmentStudentColumns } from "./segment-student-columns";
import type { SegmentStudent } from "./segment-detail-types";

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase();

export function SegmentStudentTable({
  students,
  headerAction,
}: {
  students: SegmentStudent[];
  headerAction?: ReactNode;
}) {
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const table = useReactTable({
    data: students,
    columns: segmentStudentColumns,
    state: { globalFilter: search, pagination },
    onPaginationChange: setPagination,
    globalFilterFn: (row, columnId, value: string) =>
      normalize(String(row.getValue(columnId))).includes(
        normalize(value.trim()),
      ),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row.id,
  });
  const total = table.getFilteredRowModel().rows.length;
  const start = total ? pagination.pageIndex * pagination.pageSize + 1 : 0;
  const end = Math.min((pagination.pageIndex + 1) * pagination.pageSize, total);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-base font-semibold text-text-primary">
            Danh sách học sinh
          </h2>
          {headerAction}
        </div>
        <InputGroup className="h-9 w-full sm:max-w-xs">
          <InputGroupAddon
            align="inline-start"
            className="pr-0 text-text-tertiary"
          >
            <Search1 size={17} aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            aria-label="Tìm học sinh trong segment"
            placeholder="Tìm tên, trường, số điện thoại…"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPagination((current) => ({ ...current, pageIndex: 0 }));
            }}
            className="pl-2 text-sm"
          />
        </InputGroup>
      </div>
      {total > 0 ? (
        <TableRoot aria-label="Học sinh trong segment">
          <TableHeader className="bg-background-gray-secondary">
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    scope="col"
                    className="whitespace-nowrap px-4"
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
                    className="px-4 py-4 text-sm font-normal text-text-secondary"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </TableRoot>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-card-border px-5 py-4 text-center">
          <StudentCardEmptyState
            message={
              students.length
                ? "Không tìm thấy học sinh phù hợp."
                : "Segment hiện chưa có học sinh."
            }
            className="[&>div]:mb-4 [&>div]:size-36 [&>p]:text-base [&>p]:font-semibold [&>p]:text-text-primary"
          />
          <p className="text-sm text-text-tertiary">
            {students.length
              ? "Thử tìm kiếm với từ khóa khác."
              : "Học sinh thuộc segment sẽ hiển thị tại đây."}
          </p>
        </div>
      )}
      <footer className="mt-5 flex flex-col gap-3 border-t border-card-border px-1 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p
          aria-live="polite"
          className="shrink-0 whitespace-nowrap text-xs text-text-secondary"
        >
          Hiển thị{" "}
          <span className="font-semibold text-text-primary">
            {start.toLocaleString("vi-VN")}–{end.toLocaleString("vi-VN")}
          </span>{" "}
          trong tổng số{" "}
          <span className="font-semibold text-text-primary">
            {total.toLocaleString("vi-VN")}
          </span>{" "}
          học sinh
        </p>
        <div className="flex shrink-0 items-center justify-end max-sm:w-full">
          <Pagination
            currentPage={pagination.pageIndex + 1}
            totalPages={Math.max(1, table.getPageCount())}
            onPageChange={(page) => table.setPageIndex(page - 1)}
            variant="compact"
          />
        </div>
      </footer>
    </div>
  );
}
