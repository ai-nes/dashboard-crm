"use client";

import { Copy4, Trash1 } from "@tailgrids/icons";
import type { KeyboardEvent } from "react";

import { Button } from "@/components/tailgrids/core/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/tailgrids/core/tooltip";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";

import type { MessageTemplateRecord } from "./message-template-data";

interface MessageTemplateTableProps {
  templates: MessageTemplateRecord[];
  totalCount: number;
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

export default function MessageTemplateTable({
  templates,
  totalCount,
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
    onEdit(template);
  };

  return (
    <TableRoot
      fullBleed
      className="w-full min-w-[54rem] border-0"
      aria-label="Danh sách mẫu tin nhắn"
    >
      <TableHeader className="bg-background-gray-secondary">
        <TableRow>
          <TableHead scope="col" className="w-36 whitespace-nowrap">
            Mã mẫu
          </TableHead>
          <TableHead scope="col" className="min-w-72 whitespace-nowrap">
            Tên mẫu
          </TableHead>
          <TableHead scope="col" className="whitespace-nowrap">
            Người sở hữu
          </TableHead>
          <TableHead scope="col" className="whitespace-nowrap">
            Ngày tạo
          </TableHead>
          <TableHead scope="col" className="whitespace-nowrap">
            Ngày chỉnh sửa
          </TableHead>
          <TableHead scope="col" className="w-28 whitespace-nowrap text-right">
            Thao tác
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {templates.map((template) => (
          <TableRow
            key={template.id}
            tabIndex={0}
            aria-label={`Chỉnh sửa ${template.name}`}
            onClick={() => onEdit(template)}
            onKeyDown={(event) => handleRowKeyDown(event, template)}
            className="cursor-pointer outline-none hover:bg-background-gray-secondary/30 focus-visible:bg-background-gray-secondary/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500"
          >
            <TableCell className="whitespace-nowrap font-mono text-xs text-text-tertiary">
              {template.code}
            </TableCell>
            <TableCell className="min-w-72 text-sm font-semibold text-text-primary">
              {template.name}
            </TableCell>
            <TableCell className="whitespace-nowrap text-sm text-text-secondary">
              {template.owner}
            </TableCell>
            <TableCell className="whitespace-nowrap text-sm text-text-secondary">
              {formatDate(template.createdAt)}
            </TableCell>
            <TableCell className="whitespace-nowrap text-sm text-text-secondary">
              {formatDate(template.modifiedAt)}
            </TableCell>
            <TableCell className="text-right">
              <div
                className="flex justify-end gap-1"
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
              >
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
              </div>
            </TableCell>
          </TableRow>
        ))}
        {templates.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="py-16 text-center text-sm text-text-tertiary">
              {totalCount === 0
                ? "Chưa có mẫu tin nhắn nào. Tạo mẫu để bắt đầu."
                : "Không tìm thấy mẫu tin nhắn phù hợp."}
            </TableCell>
          </TableRow>
        ) : null}
      </TableBody>
    </TableRoot>
  );
}
