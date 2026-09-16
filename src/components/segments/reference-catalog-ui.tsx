"use client";

import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";

export const STATUS_FILTERS = ["all", "enabled", "disabled"] as const;
export type StatusFilter = (typeof STATUS_FILTERS)[number];

export function statusLabel(value: StatusFilter): string {
  if (value === "enabled") return "Đang dùng";
  if (value === "disabled") return "Đã tắt";
  return "Tất cả trạng thái";
}

export function CatalogToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  searchLabel,
  status,
  onStatusChange,
  statusLabelText = "Lọc trạng thái",
  children,
  actions,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  searchLabel: string;
  status?: StatusFilter;
  onStatusChange?: (value: StatusFilter) => void;
  statusLabelText?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="border-b border-card-border px-4 py-3 sm:px-5">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchLabel}
          className="h-9 min-w-0 flex-1 sm:max-w-md"
        />
        {children}
        {status && onStatusChange && (
          <Select
            value={status}
            onChange={(value) => onStatusChange(String(value) as StatusFilter)}
            aria-label={statusLabelText}
            className="w-full gap-0 sm:w-48"
          >
            <SelectTrigger size="sm" className="w-full justify-between">
              <SelectValue />
              <SelectIndicator />
            </SelectTrigger>
            <SelectContent className="min-w-(--trigger-width)">
              {STATUS_FILTERS.map((value) => (
                <SelectItem key={value} id={value} textValue={statusLabel(value)}>
                  {statusLabel(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {actions && <div className="sm:ml-auto">{actions}</div>}
      </div>
    </div>
  );
}

export function CatalogLoading({ label }: { label: string }) {
  return (
    <div className="space-y-3 px-5 py-8" role="status" aria-label={label}>
      <p className="text-sm text-text-tertiary">{label}</p>
      {["one", "two", "three"].map((item) => (
        <div
          key={item}
          className="h-10 animate-pulse rounded-lg bg-background-gray-secondary motion-reduce:animate-none"
        />
      ))}
    </div>
  );
}

export function CatalogError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-5 py-16 text-center" role="alert">
      <p className="text-sm text-text-secondary">{message}</p>
      <Button size="sm" appearance="outline" onPress={onRetry}>
        Thử lại
      </Button>
    </div>
  );
}

export function CatalogEmpty({
  title,
  description,
  action,
  actionLabel = "Thêm bản ghi",
}: {
  title: string;
  description: string;
  action?: () => void;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-5 py-16 text-center">
      <p className="text-sm font-medium text-text-primary">{title}</p>
      <p className="text-sm text-text-tertiary">{description}</p>
      {action && (
        <Button size="sm" className="mt-2" onPress={action}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
