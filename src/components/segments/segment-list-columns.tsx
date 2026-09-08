"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Pencil1, Trash1 } from "@tailgrids/icons";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import {
  SEGMENT_TYPE_LABELS,
  type SegmentListItem,
} from "./segment-list-types";

interface SegmentColumnOptions {
  detailBaseHref: string;
  onEdit: (segment: SegmentListItem) => void;
  onDelete: (segment: SegmentListItem) => void;
}

export function getSegmentListColumns({
  detailBaseHref,
  onEdit,
  onDelete,
}: SegmentColumnOptions): ColumnDef<SegmentListItem>[] {
  return [
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
      accessorKey: "type",
      header: "Loại",
      enableGlobalFilter: false,
      filterFn: "equals",
      cell: ({ row }) => (
        <Badge
          color={row.original.type === "AUTOMATIC" ? "sky" : "violet"}
          className="whitespace-nowrap"
        >
          {SEGMENT_TYPE_LABELS[row.original.type]}
        </Badge>
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
      accessorKey: "creator",
      header: "Người tạo",
      cell: ({ row }) => (
        <span className="whitespace-nowrap">{row.original.creator}</span>
      ),
    },
    {
      accessorKey: "usedIn",
      header: "Được sử dụng",
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <span className="whitespace-nowrap tabular-nums">
          {row.original.usedIn} nơi
        </span>
      ),
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            appearance="ghost"
            size="sm"
            aria-label={`Sửa ${row.original.name}`}
            onPress={() => onEdit(row.original)}
          >
            <Pencil1 size={16} aria-hidden="true" />
            Sửa
          </Button>
          <Button
            variant="danger"
            appearance="ghost"
            size="sm"
            aria-label={`Xóa ${row.original.name}`}
            onPress={() => onDelete(row.original)}
          >
            <Trash1 size={16} aria-hidden="true" />
            Xóa
          </Button>
        </div>
      ),
    },
  ];
}
