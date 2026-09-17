"use client";

import { Copy4, Trash1 } from "@tailgrids/icons";
import type { KeyboardEvent } from "react";

import {
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRoot,
  AdminTableRow,
} from "@/components/common/admin/admin-table";
import { Button } from "@/components/tailgrids/core/button";
import { Skeleton } from "@/components/tailgrids/core/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/tailgrids/core/tooltip";

import type { MessageTemplateRecord } from "./message-template-data";

const SKELETON_ROW_COUNT = 10;

interface MessageTemplateTableProps {
  templates: MessageTemplateRecord[];
  totalCount: number;
  canCreate?: boolean;
  canDelete?: boolean;
  isLoading?: boolean;
  onDuplicate: (template: MessageTemplateRecord) => void;
  onDelete: (template: MessageTemplateRecord) => void;
  onEdit: (template: MessageTemplateRecord) => void;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(value));
}

function MessageTemplateSkeletonRows() {
  return Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
    <AdminTableRow
      key={`message-template-skeleton-${index}`}
      aria-hidden="true"
    >
      <AdminTableCell className="h-16">
        <Skeleton className="h-3.5 w-16" />
      </AdminTableCell>
      <AdminTableCell className="h-16 min-w-72">
        <Skeleton className={index % 3 === 0 ? "h-3.5 w-56" : "h-3.5 w-44"} />
      </AdminTableCell>
      <AdminTableCell className="h-16">
        <Skeleton className="h-3.5 w-32" />
      </AdminTableCell>
      <AdminTableCell className="h-16">
        <Skeleton className="h-3.5 w-20" />
      </AdminTableCell>
      <AdminTableCell className="h-16">
        <Skeleton className="h-3.5 w-20" />
      </AdminTableCell>
      <AdminTableCell className="h-16">
        <div className="flex justify-end gap-1">
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="size-8 rounded-md" />
        </div>
      </AdminTableCell>
    </AdminTableRow>
  ));
}

export default function MessageTemplateTable({
  templates,
  totalCount,
  canCreate = true,
  canDelete = true,
  isLoading = false,
  onDuplicate,
  onDelete,
  onEdit,
}: MessageTemplateTableProps) {
  const handleRowKeyDown = (
    event: KeyboardEvent<HTMLTableRowElement>,
    template: MessageTemplateRecord,
  ) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    if (template.canEdit) onEdit(template);
  };

  return (
    <AdminTableRoot
      className="min-w-[54rem]"
      aria-label="Danh sách mẫu tin nhắn"
      aria-busy={isLoading || undefined}
    >
      {isLoading ? (
        <caption className="sr-only">Đang tải danh sách mẫu email</caption>
      ) : null}
      <AdminTableHeader>
        <AdminTableRow>
          <AdminTableHead scope="col" className="w-36">
            Mã mẫu
          </AdminTableHead>
          <AdminTableHead scope="col" className="min-w-72">
            Tên mẫu
          </AdminTableHead>
          <AdminTableHead scope="col">Người sở hữu</AdminTableHead>
          <AdminTableHead scope="col">Ngày tạo</AdminTableHead>
          <AdminTableHead scope="col">Ngày chỉnh sửa</AdminTableHead>
          <AdminTableHead scope="col" className="w-28 text-right">
            Thao tác
          </AdminTableHead>
        </AdminTableRow>
      </AdminTableHeader>
      <AdminTableBody>
        {isLoading ? (
          <MessageTemplateSkeletonRows />
        ) : (
          templates.map((template) => (
            <AdminTableRow
              key={template.id}
              tabIndex={template.canEdit ? 0 : -1}
              aria-label={
                template.canEdit ? `Chỉnh sửa ${template.name}` : template.name
              }
              onClick={() => template.canEdit && onEdit(template)}
              onKeyDown={(event) => handleRowKeyDown(event, template)}
              className={
                template.canEdit
                  ? "cursor-pointer outline-none hover:bg-background-gray-secondary/30 focus-visible:bg-background-gray-secondary/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500"
                  : "outline-none"
              }
            >
              <AdminTableCell className="whitespace-nowrap font-mono text-xs text-text-tertiary">
                {template.code}
              </AdminTableCell>
              <AdminTableCell className="min-w-72 text-sm font-semibold text-text-primary">
                {template.name}
              </AdminTableCell>
              <AdminTableCell className="whitespace-nowrap text-sm text-text-secondary">
                {template.owner}
              </AdminTableCell>
              <AdminTableCell className="whitespace-nowrap text-sm text-text-secondary">
                {formatDate(template.createdAt)}
              </AdminTableCell>
              <AdminTableCell className="whitespace-nowrap text-sm text-text-secondary">
                {formatDate(template.modifiedAt)}
              </AdminTableCell>
              <AdminTableCell className="text-right">
                <div
                  className="flex justify-end gap-1"
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  {canCreate ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          iconOnly
                          size="sm"
                          appearance="ghost"
                          aria-label={`Nhân bản ${template.name}`}
                          onPress={() => onDuplicate(template)}
                        >
                          <Copy4 size={17} aria-hidden="true" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Nhân bản</TooltipContent>
                    </Tooltip>
                  ) : null}
                  {canDelete && template.canEdit ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          iconOnly
                          size="sm"
                          appearance="ghost"
                          variant="danger"
                          aria-label={`Xóa ${template.name}`}
                          onPress={() => onDelete(template)}
                        >
                          <Trash1 size={17} aria-hidden="true" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Xóa</TooltipContent>
                    </Tooltip>
                  ) : null}
                </div>
              </AdminTableCell>
            </AdminTableRow>
          ))
        )}
        {!isLoading && templates.length === 0 ? (
          <AdminTableRow>
            <AdminTableCell
              colSpan={6}
              className="py-16 text-center text-sm text-text-tertiary"
            >
              {totalCount === 0
                ? "Chưa có mẫu tin nhắn nào. Tạo mẫu để bắt đầu."
                : "Không tìm thấy mẫu tin nhắn phù hợp."}
            </AdminTableCell>
          </AdminTableRow>
        ) : null}
      </AdminTableBody>
    </AdminTableRoot>
  );
}
