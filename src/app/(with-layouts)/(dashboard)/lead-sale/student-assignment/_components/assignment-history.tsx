"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowLeft, ArrowRight, Close, Search1 } from "@tailgrids/icons";
import { Label } from "react-aria-components";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { Input } from "@/components/tailgrids/core/input";
import { TextField } from "@/components/tailgrids/core/text-field";
import { cn } from "@/utils/cn";
import { useAssignment } from "./assignment-context";
import { candidates } from "./data";
import { historyColumns } from "./history-columns";
import { statusColors, statusLabels } from "./mappings";
import type { AssignmentFilter } from "./types";

const filters: { id: AssignmentFilter; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "assigned", label: "Đã phân công" },
  { id: "review", label: "Chờ phân công" },
];
const normalize = (value: string) =>
  value
    .toLocaleLowerCase("vi")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");

export default function AssignmentHistory() {
  "use no memo";
  const { records, filter, setFilter, inspect } = useAssignment();
  const [query, setQuery] = useState("");
  const columns = useMemo(() => historyColumns(inspect), [inspect]);
  const filtered = useMemo(
    () =>
      records.filter((record) => {
        const matchesStatus =
          filter === "all" ||
          (filter === "review"
            ? !record.ownerId
            : filter === "assigned"
              ? Boolean(record.ownerId)
              : record.status === filter);
        const owner =
          candidates.find((person) => person.id === record.ownerId)?.name ?? "";
        return (
          matchesStatus &&
          normalize(`${record.name} ${record.school} ${owner}`).includes(
            normalize(query.trim()),
          )
        );
      }),
    [records, filter, query],
  );
  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 6 } },
  });
  const rows = table.getRowModel().rows;
  const page = table.getState().pagination.pageIndex;

  return (
    <section
      id="assignment-history"
      aria-labelledby="history-heading"
      className="scroll-mt-24"
    >
      <Card className="overflow-hidden p-0">
        <div className="flex flex-wrap items-start justify-between gap-4 px-5 pt-5">
          <div>
            <h2
              id="history-heading"
              className="text-base font-semibold text-text-primary"
            >
              Lịch sử phân công
            </h2>
            <p className="mt-1 text-xs leading-5 text-text-tertiary">
              Xem kết quả và lý do phân công của từng học sinh.
            </p>
          </div>
          <TextField
            value={query}
            onChange={setQuery}
            className="w-full sm:w-64"
          >
            <Label className="sr-only">
              Tìm học sinh, trường hoặc người phụ trách
            </Label>
            <div className="relative">
              <Search1
                size={16}
                aria-hidden="true"
                className="pointer-events-none absolute top-3 left-3 text-text-tertiary"
              />
              <Input
                placeholder="Tìm học sinh, nhân sự…"
                className="h-10 w-full pr-8 pl-9 text-sm"
              />
              {query && (
                <Button
                  iconOnly
                  appearance="ghost"
                  size="xs"
                  aria-label="Xóa tìm kiếm"
                  className="absolute top-1.5 right-1 text-text-tertiary"
                  onPress={() => setQuery("")}
                >
                  <Close size={13} />
                </Button>
              )}
            </div>
          </TextField>
        </div>
        <div
          className="flex flex-wrap gap-1.5 px-5 py-4"
          role="group"
          aria-label="Lọc kết quả phân công"
        >
          {filters.map((item) => (
            <Button
              key={item.id}
              appearance="ghost"
              size="sm"
              aria-pressed={filter === item.id}
              className={cn(
                "text-text-secondary",
                filter === item.id &&
                  "bg-badge-primary-background text-badge-primary-text",
              )}
              onPress={() => setFilter(item.id)}
            >
              {item.label}
            </Button>
          ))}
          {(filter === "missing_data" || filter === "no_match") && (
            <Button
              appearance="ghost"
              size="sm"
              className="bg-badge-warning-background text-badge-warning-text"
              onPress={() => setFilter("all")}
            >
              {statusLabels[filter]}
              <Close size={13} aria-hidden="true" />
            </Button>
          )}
        </div>

        <div className="hidden overflow-x-auto xl:block">
          <table className="w-full table-fixed text-left text-sm">
            <caption className="sr-only">
              Lịch sử phân công học sinh ngày 05/09/2026, dữ liệu minh họa
            </caption>
            <colgroup>
              <col className="w-[30%]" />
              <col className="w-[24%]" />
              <col className="w-[24%]" />
              <col className="w-[10%]" />
              <col className="w-[12%]" />
            </colgroup>
            <thead className="border-y border-card-border bg-background-gray-secondary/60 text-xs text-text-tertiary">
              {table.getHeaderGroups().map((group) => (
                <tr key={group.id}>
                  {group.headers.map((header) => (
                    <th
                      key={header.id}
                      scope="col"
                      className="px-4 py-3 font-medium whitespace-nowrap first:pl-5"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-card-border">
              {rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-4 align-middle first:pl-5"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="divide-y divide-card-border border-t border-card-border xl:hidden">
          {rows.map(({ original: record }) => (
            <div key={record.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-text-primary">
                  {record.name}
                </p>
                <span className="text-xs text-text-tertiary">
                  {record.time}
                </span>
              </div>
              <p className="mt-1 text-xs text-text-tertiary">{record.school}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <Badge color={statusColors[record.status]}>
                  {statusLabels[record.status]}
                </Badge>
                <Button
                  appearance="ghost"
                  size="sm"
                  className="text-text-secondary"
                  aria-label={`Xem chi tiết ${record.name}`}
                  onPress={() => inspect(record.id)}
                >
                  Chi tiết
                  <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
        {!rows.length && (
          <div className="px-5 py-10 text-center">
            <Search1
              size={24}
              className="mx-auto text-text-tertiary"
              aria-hidden="true"
            />
            <p className="mt-3 text-sm font-medium text-text-primary">
              Không có học sinh phù hợp
            </p>
            <p className="mt-1 text-xs text-text-tertiary">
              Thử đổi từ khóa hoặc bỏ bộ lọc.
            </p>
            <Button
              appearance="ghost"
              size="sm"
              className="mx-auto mt-3"
              onPress={() => {
                setQuery("");
                setFilter("all");
              }}
            >
              Xóa bộ lọc
            </Button>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-card-border px-5 py-3">
          <p className="text-xs text-text-tertiary" aria-live="polite">
            {filtered.length
              ? `${page * 6 + 1}–${Math.min((page + 1) * 6, filtered.length)} trong ${filtered.length} học sinh`
              : "0 học sinh"}
          </p>
          <div className="flex items-center gap-2">
            <Button
              appearance="outline"
              size="sm"
              iconOnly
              aria-label="Trang trước"
              className="border-card-border text-text-secondary"
              isDisabled={!table.getCanPreviousPage()}
              onPress={() => table.previousPage()}
            >
              <ArrowLeft size={16} />
            </Button>
            <span className="min-w-12 text-center text-xs tabular-nums text-text-secondary">
              {page + 1} / {Math.max(1, table.getPageCount())}
            </span>
            <Button
              appearance="outline"
              size="sm"
              iconOnly
              aria-label="Trang sau"
              className="border-card-border text-text-secondary"
              isDisabled={!table.getCanNextPage()}
              onPress={() => table.nextPage()}
            >
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
}
