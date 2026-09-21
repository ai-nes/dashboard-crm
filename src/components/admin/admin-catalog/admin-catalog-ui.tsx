"use client";

import { Pencil1, Plus, Trash1 } from "@tailgrids/icons";
import type {
  FormEvent,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react";

import { AdminSearchInput } from "@/components/common/admin/admin-search-input";
import {
  AdminTableBody,
  AdminTableFrame,
  AdminTableHead,
  AdminTableHeader,
  AdminTablePagination,
  AdminTableRoot,
} from "@/components/common/admin/admin-table";
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
import { Skeleton } from "@/components/tailgrids/core/skeleton";
import { cn } from "@/utils/cn";

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
  toolbar,
  showHeader = true,
  contentClassName,
  children,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
  toolbar?: ReactNode;
  showHeader?: boolean;
  contentClassName?: string;
  children: ReactNode;
}) {
  const panel = (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-card-border bg-card-background shadow-xs">
      {showHeader ? (
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-card-border px-5 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-text-primary">
              {title}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-text-tertiary">
              {description}
            </p>
          </div>
          {actions}
        </div>
      ) : null}
      <div className={cn("min-h-0 overflow-hidden", contentClassName)}>
        {children}
      </div>
    </section>
  );

  return toolbar ? (
    <div className="flex min-h-0 flex-col gap-3">
      {toolbar}
      {panel}
    </div>
  ) : (
    panel
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
    <div className="flex shrink-0 items-center gap-2">
      <Button size="sm" onPress={onCreate} isDisabled={isDisabled}>
        <Plus size={16} aria-hidden="true" />
        <span>{createLabel}</span>
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
        className="max-h-[calc(100vh-2rem)] max-w-2xl overflow-hidden p-0"
      >
        <form onSubmit={onSubmit}>
          <DialogHeader className="border-b border-card-border px-5 py-4 pr-12">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className="text-text-tertiary">
              {description}
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="max-h-[min(44rem,calc(100vh-10rem))] space-y-4 overflow-y-auto px-5 py-5">
            {children}
          </DialogBody>
          <DialogFooter className="border-t border-card-border px-5 py-3">
            <DialogClose appearance="outline" size="sm" isDisabled={isSaving}>
              Hủy
            </DialogClose>
            <Button size="sm" type="submit" isDisabled={isSaving}>
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
    <div className="flex flex-col items-center justify-center px-5 py-16 text-center text-sm text-text-tertiary">
      {children}
    </div>
  );
}

export function LoadingState({
  label = "Đang tải dữ liệu…",
}: {
  label?: string;
}) {
  return (
    <div
      className="space-y-3 px-5 py-8"
      role="status"
      aria-live="polite"
    >
      <p className="text-sm text-text-tertiary">{label}</p>
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
      className="flex flex-col items-center justify-center gap-3 px-5 py-16 text-center"
      role="alert"
      aria-live="assertive"
    >
      <p className="text-sm text-text-secondary">{message}</p>
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
    <AdminTableFrame className="max-h-[min(32rem,calc(100vh-22rem))]">
      <div className="max-h-[min(32rem,calc(100vh-22rem))] overflow-y-auto">
        <AdminTableRoot
          aria-label={caption}
          className="w-full min-w-[680px] border-0"
        >
          <caption className="sr-only">{caption}</caption>
          <AdminTableHeader>
            <tr>
              {headers.map((header) => (
                <AdminTableHead key={header} scope="col">
                  {header}
                </AdminTableHead>
              ))}
            </tr>
          </AdminTableHeader>
          <AdminTableBody className="[&>tr]:transition-colors [&>tr]:hover:bg-background-gray-secondary/30 [&>tr:not(:last-child)]:border-b [&>tr:not(:last-child)]:border-border-primary [&>tr>td]:px-5 [&>tr>td]:py-3.5">
            {children}
          </AdminTableBody>
        </AdminTableRoot>
      </div>
    </AdminTableFrame>
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
  actions,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  total: number;
  placeholder?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex shrink-0 flex-col gap-3 rounded-xl border border-card-border bg-card-background px-4 py-3 sm:flex-row sm:items-center sm:px-5">
      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <AdminSearchInput
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-9 min-w-0 flex-1 sm:max-w-md"
        />
      </div>
      <div className="flex shrink-0 items-center justify-between gap-2 sm:justify-end">
        <Badge color="gray" size="sm">
          {total} mục
        </Badge>
        {actions}
      </div>
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
      className="mt-0 shrink-0 px-5 py-4"
    />
  );
}

export function formatDate(value?: string) {
  if (!value) return "—";
  return value.slice(0, 10);
}
