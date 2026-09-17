"use client";

import { Pencil1, Plus, Trash1 } from "@tailgrids/icons";
import type {
  FormEvent,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react";

import { AdminSearchInput } from "@/components/common/admin/admin-search-input";
import { AdminTablePagination } from "@/components/common/admin/admin-table";
import { DatePickerField } from "@/components/common/date-picker-field";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { Backdrop } from "@/components/tailgrids/core/overlay";
import {
  ScrollArea,
  ScrollAreaViewport,
  ScrollBar,
} from "@/components/tailgrids/core/scroll-area";
import { Skeleton } from "@/components/tailgrids/core/skeleton";

export const fieldClassName =
  "w-full rounded-lg border border-card-border bg-input-background px-3 py-2.5 text-sm text-text-primary outline-none placeholder:text-input-placeholder-text focus:border-input-primary-focus-border focus:ring-4 focus:ring-input-primary-focus-border/20 disabled:cursor-not-allowed disabled:opacity-60";

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-input-label-text">{label}</span>
      {children}
      {hint ? <span className="text-xs text-text-tertiary">{hint}</span> : null}
      {error ? (
        <span className="text-xs text-input-error" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`${fieldClassName} ${props.className ?? ""}`}
    />
  );
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`${fieldClassName} ${props.className ?? ""}`}
    />
  );
}

export function DateTimePickerField({
  value,
  onChange,
  ariaLabel,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  disabled?: boolean;
}) {
  const [date = "", time = ""] = value.split("T");

  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_7rem] gap-2">
      <DatePickerField
        value={date}
        onChange={(nextDate) =>
          onChange(nextDate ? `${nextDate}T${time || "00:00"}` : "")
        }
        ariaLabel={`${ariaLabel} - ngày`}
        disabled={disabled}
      />
      <TextInput
        type="time"
        value={time}
        aria-label={`${ariaLabel} - giờ`}
        disabled={disabled}
        onChange={(event) =>
          onChange(date ? `${date}T${event.target.value}` : "")
        }
      />
    </div>
  );
}

export function Panel({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-card-border bg-card-background shadow-xs">
      <div className="flex flex-col gap-2 border-b border-card-border px-5 py-4 sm:flex-row sm:items-start sm:justify-between lg:px-6">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          <p className="mt-1 max-w-3xl text-sm leading-5 text-text-secondary">
            {description}
          </p>
        </div>
        {actions}
      </div>
      <div className="p-4 lg:p-5">{children}</div>
    </section>
  );
}

export function PanelHeaderActions({
  createLabel,
  onCreate,
  isDisabled = false,
}: {
  createLabel: string;
  onCreate: () => void;
  isDisabled?: boolean;
}) {
  return (
    <div className="flex w-full shrink-0 justify-end sm:w-auto">
      <Button size="sm" onPress={onCreate} isDisabled={isDisabled}>
        <Plus size={16} aria-hidden="true" />
        {createLabel}
      </Button>
    </div>
  );
}

export function CatalogEditorDialog({
  title,
  description,
  isOpen,
  isSaving = false,
  submitLabel,
  onOpenChange,
  onSubmit,
  children,
}: {
  title: string;
  description: string;
  isOpen: boolean;
  isSaving?: boolean;
  submitLabel: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
}) {
  return (
    <Backdrop
      isOpen={isOpen}
      isDismissable={!isSaving}
      onOpenChange={(open) => {
        if (open || !isSaving) onOpenChange(open);
      }}
    >
      <Dialog
        aria-label={title}
        className="flex max-h-[calc(100vh-2rem)] min-h-0 max-w-3xl flex-col overflow-hidden p-0"
      >
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={onSubmit}>
          <DialogHeader className="shrink-0 border-b border-card-border px-5 py-4 pr-12">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className="text-text-tertiary">
              {description}
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="min-h-0 flex-1 p-0">
            <ScrollArea className="h-full min-h-0 overflow-hidden">
              <ScrollAreaViewport className="h-full min-w-0 overflow-x-hidden px-5 py-5">
                {children}
              </ScrollAreaViewport>
              <ScrollBar />
            </ScrollArea>
          </DialogBody>
          <DialogFooter className="shrink-0 border-t border-card-border bg-card-background px-5 py-3">
            <DialogClose appearance="outline" size="sm" isDisabled={isSaving}>
              Hủy
            </DialogClose>
            <Button size="sm" type="submit" isDisabled={isSaving}>
              {!isSaving && submitLabel.startsWith("Thêm") ? (
                <Plus size={16} aria-hidden="true" />
              ) : null}
              {isSaving ? "Đang lưu…" : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </Backdrop>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-card-border px-4 py-8 text-center text-sm text-text-tertiary">
      {children}
    </p>
  );
}

export function LoadingState({
  label = "Đang tải dữ liệu…",
}: {
  label?: string;
}) {
  return (
    <div
      className="space-y-3 rounded-lg border border-card-border px-4 py-6"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">{label}</span>
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-5/6" />
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-input-error-focus-border/40 bg-input-error-focus-border/5 px-4 py-3 text-sm text-input-error"
      role="alert"
      aria-live="assertive"
    >
      <span>{message}</span>
      {onRetry ? (
        <Button size="sm" appearance="outline" onPress={onRetry}>
          Thử lại
        </Button>
      ) : null}
    </div>
  );
}

export function Table({
  headers,
  caption,
  children,
}: {
  headers: string[];
  caption: string;
  children: ReactNode;
}) {
  return (
    <ScrollArea className="h-[min(32rem,calc(100vh-22rem))] max-h-[min(32rem,calc(100vh-22rem))] min-h-0 overflow-hidden rounded-xl border border-card-border">
      <ScrollAreaViewport>
        <table
          className="w-full min-w-[680px] text-left text-sm"
          aria-label={caption}
        >
          <caption className="sr-only">{caption}</caption>
          <thead className="sticky top-0 z-10 bg-background-gray-secondary/95 text-xs text-text-tertiary">
            <tr>
              {headers.map((header) => (
                <th key={header} scope="col" className="px-3 py-3 font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">{children}</tbody>
        </table>
      </ScrollAreaViewport>
      <ScrollBar />
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

export function RowActions({
  onEdit,
  onDelete,
  deleteLabel = "Xóa",
  isDisabled = false,
}: {
  onEdit?: () => void;
  onDelete?: () => void;
  deleteLabel?: string;
  isDisabled?: boolean;
}) {
  if (!onEdit && !onDelete) return null;
  return (
    <div className="flex justify-end gap-1">
      {onEdit ? (
        <Button
          aria-label="Sửa"
          iconOnly
          size="sm"
          appearance="ghost"
          isDisabled={isDisabled}
          onPress={onEdit}
        >
          <Pencil1 size={16} aria-hidden="true" />
        </Button>
      ) : null}
      {onDelete ? (
        <Button
          aria-label={deleteLabel}
          iconOnly
          size="sm"
          appearance="ghost"
          variant="danger"
          isDisabled={isDisabled}
          onPress={onDelete}
        >
          <Trash1 size={16} aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  );
}

export function StatusBadge({
  children,
  tone = "gray",
}: {
  children: ReactNode;
  tone?: "gray" | "success" | "warning" | "danger";
}) {
  return (
    <Badge
      color={
        tone === "warning" ? "warning" : tone === "danger" ? "error" : tone
      }
      size="sm"
    >
      {children}
    </Badge>
  );
}

export function CatalogListToolbar({
  search,
  onSearchChange,
  total,
  placeholder = "Tìm theo tên hoặc mã…",
}: {
  search: string;
  onSearchChange: (value: string) => void;
  total: number;
  placeholder?: string;
}) {
  return (
    <div className="mb-3 flex shrink-0 flex-col gap-3 rounded-xl border border-card-border bg-card-background px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <AdminSearchInput
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="min-w-0 flex-1 sm:max-w-md"
      />
      <Badge color="gray" size="sm">
        {total} mục
      </Badge>
    </div>
  );
}

export function CatalogPagination({
  page,
  total,
  pageSize,
  onPageChange,
  isDisabled = false,
}: {
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isDisabled?: boolean;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages === 1 && total === 0) return null;
  return (
    <AdminTablePagination
      currentPage={page}
      totalPages={totalPages}
      totalItems={total}
      pageSize={pageSize}
      onPageChange={onPageChange}
      isDisabled={isDisabled}
      className="mt-0 shrink-0 border-t border-card-border px-0 py-3 sm:py-4"
    />
  );
}

export function formatDate(value?: string) {
  if (!value) return "—";
  return value.slice(0, 10);
}
