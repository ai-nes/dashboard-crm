"use client";

import Link from "next/link";
import { ArrowLeft, Pencil1, Trash1 } from "@tailgrids/icons";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import {
  SEGMENT_TYPE_LABELS,
  type SegmentListItem,
} from "./segment-list-types";

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(date));

interface SegmentDetailHeaderProps {
  segment: SegmentListItem;
  createdAt: string;
  backHref: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function SegmentDetailHeader({
  segment,
  createdAt,
  backHref,
  onEdit,
  onDelete,
}: SegmentDetailHeaderProps) {
  return (
    <header className="relative isolate shrink-0 overflow-hidden rounded-2xl border border-card-border bg-card-background px-5 py-5 shadow-xs sm:px-6 lg:px-7 lg:py-6">
      <div className="pointer-events-none absolute -top-24 -right-8 -z-10 size-72 rounded-full bg-primary-50/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-1/3 -z-10 size-60 rounded-full bg-badge-sky-background/50 blur-3xl" />
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 rounded text-xs font-medium text-text-secondary outline-none hover:text-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Quay lại quản lý segments
          </Link>
          <h1 className="mt-3 text-balance text-[26px] leading-9 font-semibold tracking-[-0.5px] text-text-primary sm:text-[30px]">
            {segment.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge color={segment.type === "AUTOMATIC" ? "sky" : "violet"}>
              {SEGMENT_TYPE_LABELS[segment.type]}
            </Badge>
            <span className="text-xs text-text-tertiary">
              {segment.size.toLocaleString("vi-VN")} học sinh
            </span>
          </div>
          {segment.description && (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
              {segment.description}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-text-tertiary">
            <span>
              Ngày tạo:{" "}
              <strong className="font-medium text-text-secondary">
                {formatDate(createdAt)}
              </strong>
            </span>
            <span>
              Cập nhật lần cuối:{" "}
              <strong className="font-medium text-text-secondary">
                {formatDate(segment.updatedAt)}
              </strong>
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button size="md" onPress={onEdit}>
            <Pencil1 size={16} aria-hidden="true" />
            Chỉnh sửa
          </Button>
          <Button
            size="md"
            variant="danger"
            appearance="outline"
            onPress={onDelete}
          >
            <Trash1 size={16} aria-hidden="true" />
            Xóa
          </Button>
        </div>
      </div>
    </header>
  );
}
