"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Trash1 } from "@tailgrids/icons";

import { Button } from "@/components/tailgrids/core/button";

import { type SegmentListItem, type SegmentStatus } from "./segment-list-types";
import { SegmentStatusSelect } from "./segment-status-select";

interface SegmentColumnOptions {
  detailBaseHref: string;
  onStatusChange: (segment: SegmentListItem, status: SegmentStatus) => void;
  onDelete: (segment: SegmentListItem) => void;
  isDeleteDisabled?: boolean;
}

export function getSegmentListColumns({
  detailBaseHref,
  onStatusChange,
  onDelete,
  isDeleteDisabled = false,
}: SegmentColumnOptions): ColumnDef<SegmentListItem>[] {
  return [
    {
      accessorKey: "segmentCode",
      header: "Mã segment",
      cell: ({ row }) => (
        <span className="whitespace-nowrap font-medium tabular-nums text-text-primary">
          {row.original.segmentCode}
        </span>
      ),
    },
    {
      accessorKey: "name",
      header: "Tên segment",
      cell: ({ row }) => (
        <Link
          href={`${detailBaseHref}/${row.original.id}`}
          className="inline-block min-w-56 font-semibold text-primary-500 outline-none hover:underline focus-visible:rounded focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: "size",
      header: "Số học sinh",
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <span className="tabular-nums">
          {row.original.size.toLocaleString("vi-VN")}
        </span>
      ),
    },
    {
      accessorKey: "creator",
      header: "Người tạo",
      cell: ({ row }) => (
        <span className="whitespace-nowrap">{row.original.creator}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      enableGlobalFilter: false,
      filterFn: "equals",
      cell: ({ row }) => (
        <SegmentStatusSelect
          value={row.original.status}
          ariaLabel={`Cập nhật trạng thái ${row.original.name}`}
          onChange={(status) => onStatusChange(row.original, status)}
        />
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "Cập nhật lần cuối",
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <time
          dateTime={row.original.updatedAt}
          className="whitespace-nowrap tabular-nums"
        >
          {new Intl.DateTimeFormat("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Ho_Chi_Minh",
          }).format(new Date(row.original.updatedAt))}
        </time>
      ),
    },
    {
      id: "actions",
      header: "Hành động",
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <Button
          iconOnly
          size="sm"
          variant="ghost"
          appearance="ghost"
          aria-label={`Xóa segment ${row.original.name}`}
          isDisabled={isDeleteDisabled}
          className="text-text-tertiary hover:text-error-500"
          onPress={() => onDelete(row.original)}
        >
          <Trash1 size={16} aria-hidden="true" />
        </Button>
      ),
    },
  ];
}
