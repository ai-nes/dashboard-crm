"use client";

import { Copy4, Trash1 } from "@tailgrids/icons";
import type { KeyboardEvent } from "react";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Skeleton } from "@/components/tailgrids/core/skeleton";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/tailgrids/core/tooltip";

import type { SnippetRecord } from "@/services/api/snippets";

interface SnippetTableProps {
  snippets: SnippetRecord[];
  totalCount: number;
  canCreate?: boolean;
  isLoading?: boolean;
  onDuplicate: (snippet: SnippetRecord) => void;
  onDelete: (snippet: SnippetRecord) => void;
  onEdit: (snippet: SnippetRecord) => void;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(date);
}

function getContentPreview(content: string) {
  return content
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function SnippetSkeletonRow({ index }: { index: number }) {
  return (
    <TableRow key={`snippet-skeleton-${index}`} aria-hidden="true">
      <TableCell>
        <Skeleton className="h-3 w-20 rounded-md" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-40 rounded-md" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24 rounded-md" />
      </TableCell>
      <TableCell>
        <div className="space-y-2">
          <Skeleton className="h-3 w-56 rounded-md" />
          <Skeleton className="h-3 w-36 rounded-md" />
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-28 rounded-md" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-6 w-20 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20 rounded-md" />
      </TableCell>
      <TableCell>
        <div className="flex justify-end gap-1">
          <Skeleton className="size-8 rounded-lg" />
          <Skeleton className="size-8 rounded-lg" />
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function SnippetTable({
  snippets,
  totalCount,
  canCreate = true,
  isLoading = false,
  onDuplicate,
  onDelete,
  onEdit,
}: SnippetTableProps) {
  const handleRowKeyDown = (
    event: KeyboardEvent<HTMLTableRowElement>,
    snippet: SnippetRecord,
  ) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    if (snippet.canEdit) onEdit(snippet);
  };

  return (
    <TableRoot
      fullBleed
      className="w-full min-w-[68rem] border-0"
      aria-label="Danh sách snippet"
    >
      <TableHeader className="bg-background-gray-secondary">
        <TableRow>
          <TableHead scope="col" className="w-32 whitespace-nowrap">
            Mã snippet
          </TableHead>
          <TableHead scope="col" className="min-w-56 whitespace-nowrap">
            Internal name
          </TableHead>
          <TableHead scope="col" className="w-36 whitespace-nowrap">
            Shortcut
          </TableHead>
          <TableHead scope="col" className="min-w-72 whitespace-nowrap">
            Nội dung
          </TableHead>
          <TableHead scope="col" className="whitespace-nowrap">
            Người sở hữu
          </TableHead>
          <TableHead scope="col" className="whitespace-nowrap">
            Chia sẻ
          </TableHead>
          <TableHead scope="col" className="whitespace-nowrap">
            Chỉnh sửa
          </TableHead>
          <TableHead scope="col" className="w-28 whitespace-nowrap text-right">
            Thao tác
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading
          ? Array.from({ length: 5 }, (_, index) => (
              <SnippetSkeletonRow key={index} index={index} />
            ))
          : snippets.map((snippet) => (
              <TableRow
                key={snippet.id}
                tabIndex={snippet.canEdit ? 0 : -1}
                aria-label={
                  snippet.canEdit
                    ? `Chỉnh sửa ${snippet.internalName}`
                    : snippet.internalName
                }
                onClick={() => snippet.canEdit && onEdit(snippet)}
                onKeyDown={(event) => handleRowKeyDown(event, snippet)}
                className={
                  snippet.canEdit
                    ? "cursor-pointer outline-none hover:bg-background-gray-secondary/30 focus-visible:bg-background-gray-secondary/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500"
                    : "outline-none"
                }
              >
                <TableCell className="whitespace-nowrap font-mono text-xs text-text-tertiary">
                  {snippet.code}
                </TableCell>
                <TableCell className="min-w-56 text-sm font-semibold text-text-primary">
                  {snippet.internalName}
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-text-secondary">
                  #{snippet.shortcut}
                </TableCell>
                <TableCell className="max-w-96 text-sm text-text-secondary">
                  <span className="line-clamp-2">
                    {getContentPreview(snippet.snippetText) || "—"}
                  </span>
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-text-secondary">
                  {snippet.owner}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <Badge
                    color={snippet.sharing === "public" ? "success" : "gray"}
                  >
                    {snippet.sharing === "public" ? "Công khai" : "Riêng tư"}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-text-secondary">
                  {formatDate(snippet.modifiedAt)}
                </TableCell>
                <TableCell className="text-right">
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
                            aria-label={`Nhân bản ${snippet.internalName}`}
                            onPress={() => onDuplicate(snippet)}
                          >
                            <Copy4 size={17} aria-hidden="true" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Nhân bản</TooltipContent>
                      </Tooltip>
                    ) : null}
                    {snippet.canEdit ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            iconOnly
                            size="sm"
                            appearance="ghost"
                            variant="danger"
                            aria-label={`Xóa ${snippet.internalName}`}
                            onPress={() => onDelete(snippet)}
                          >
                            <Trash1 size={17} aria-hidden="true" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Xóa</TooltipContent>
                      </Tooltip>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
        {!isLoading && snippets.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={8}
              className="py-16 text-center text-sm text-text-tertiary"
            >
              {totalCount === 0
                ? "Chưa có snippet nào. Tạo snippet để bắt đầu."
                : "Không tìm thấy snippet phù hợp."}
            </TableCell>
          </TableRow>
        ) : null}
      </TableBody>
    </TableRoot>
  );
}
