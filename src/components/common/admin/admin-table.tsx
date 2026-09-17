import type { ComponentProps } from "react";

import { Pagination } from "@/components/tailgrids/core/pagination";
import {
  TableBody as CoreTableBody,
  TableCell as CoreTableCell,
  TableHead as CoreTableHead,
  TableHeader as CoreTableHeader,
  TableRoot as CoreTableRoot,
  TableRow as CoreTableRow,
} from "@/components/tailgrids/core/table";
import { cn } from "@/utils/cn";

const tableFrameStyles =
  "overflow-hidden rounded-xl border border-card-border bg-card-background";
const tableRootStyles = "w-full border-0";
const tableHeaderStyles =
  "bg-background-gray-secondary [&_th]:border-border-secondary";
const tableHeadStyles =
  "whitespace-nowrap px-4 py-3 text-xs font-semibold text-text-secondary";
const tableRowStyles =
  "transition-colors hover:bg-background-gray-primary focus-within:bg-background-gray-primary [&>td]:align-middle";
const tableCellStyles = "px-4 py-3.5 text-sm font-normal text-text-primary";

export const ADMIN_TABLE_PAGE_SIZE = 8;

export function AdminTableFrame({
  className,
  ...props
}: ComponentProps<"section">) {
  return <section className={cn(tableFrameStyles, className)} {...props} />;
}

export function AdminTableRoot({
  className,
  ...props
}: Omit<ComponentProps<typeof CoreTableRoot>, "fullBleed">) {
  return (
    <CoreTableRoot
      fullBleed
      className={cn(tableRootStyles, className)}
      {...props}
    />
  );
}

export function AdminTableHeader({
  className,
  ...props
}: ComponentProps<typeof CoreTableHeader>) {
  return (
    <CoreTableHeader className={cn(tableHeaderStyles, className)} {...props} />
  );
}

export function AdminTableHead({
  className,
  ...props
}: ComponentProps<typeof CoreTableHead>) {
  return (
    <CoreTableHead className={cn(tableHeadStyles, className)} {...props} />
  );
}

export function AdminTableBody({
  className,
  ...props
}: ComponentProps<typeof CoreTableBody>) {
  return <CoreTableBody className={className} {...props} />;
}

export function AdminTableRow({
  className,
  ...props
}: ComponentProps<typeof CoreTableRow>) {
  return <CoreTableRow className={cn(tableRowStyles, className)} {...props} />;
}

export function AdminTableCell({
  className,
  ...props
}: ComponentProps<typeof CoreTableCell>) {
  return (
    <CoreTableCell className={cn(tableCellStyles, className)} {...props} />
  );
}

export function AdminTableFooter({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t border-card-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
      {...props}
    />
  );
}

interface AdminTablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  isDisabled?: boolean;
  className?: string;
}

export function AdminTablePagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  pageSize = ADMIN_TABLE_PAGE_SIZE,
  isDisabled = false,
  className,
}: AdminTablePaginationProps) {
  if (totalItems <= 0) return null;

  const firstItem = (currentPage - 1) * pageSize + 1;
  const lastItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <AdminTableFooter className={cn("px-5 py-4", className)}>
      <p className="text-xs text-text-tertiary" aria-live="polite">
        Hiển thị {firstItem.toLocaleString("vi-VN")} đến{" "}
        {lastItem.toLocaleString("vi-VN")} trong{" "}
        {totalItems.toLocaleString("vi-VN")}
      </p>
      {totalPages > 1 ? (
        <div className="min-w-0 sm:w-auto">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            variant="compact"
            align="end"
            sideLayout="icon"
            isDisabled={isDisabled}
          />
        </div>
      ) : null}
    </AdminTableFooter>
  );
}
