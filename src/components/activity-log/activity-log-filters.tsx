"use client";

import { useState } from "react";

import { Close, Filter, Search1 } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { AdminTableFrame } from "@/components/common/admin/admin-table";
import {
  CRM_ROLES,
  FRAPPE_TECHNICAL_ROLES,
} from "@/components/common/auth/rbac";
import type { GetActivityLogsParams } from "@/services/api/activity-log";

export type ActivityLogFilterState = Pick<
  GetActivityLogsParams,
  "actor" | "role" | "severity" | "startDate" | "endDate"
>;

interface ActivityLogFiltersProps {
  value: ActivityLogFilterState;
  onChange: (next: ActivityLogFilterState) => void;
}

const roles = [...CRM_ROLES, ...FRAPPE_TECHNICAL_ROLES];

function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDateRange(days: number) {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));

  return {
    startDate: formatDateInput(start),
    endDate: formatDateInput(end),
  };
}

export default function ActivityLogFilters({
  value,
  onChange,
}: ActivityLogFiltersProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const activeFilterCount = Object.values(value).filter(Boolean).length;

  const update = (field: keyof ActivityLogFilterState, nextValue: string) =>
    onChange({ ...value, [field]: nextValue || undefined });

  const applyDateRange = (days: number) => {
    onChange({ ...value, ...getDateRange(days) });
    setIsAdvancedOpen(true);
  };

  return (
    <AdminTableFrame className="p-4 sm:p-5" aria-label="Bộ lọc nhật ký">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Người thực hiện</span>
          <Search1
            size={18}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-tertiary"
            aria-hidden="true"
          />
          <input
            value={value.actor ?? ""}
            onChange={(event) => update("actor", event.target.value)}
            placeholder="Tìm theo tên hoặc email người thực hiện"
            className="h-10 w-full rounded-lg border border-input-border bg-input-background pr-3 pl-10 text-sm text-text-primary outline-none placeholder:text-input-placeholder-text focus-visible:ring-2 focus-visible:ring-primary-500"
          />
        </label>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <Button
            size="sm"
            appearance="outline"
            onPress={() => applyDateRange(7)}
            aria-pressed={Boolean(value.startDate && value.endDate)}
            className="justify-center"
          >
            7 ngày gần đây
          </Button>
          <Button
            size="sm"
            appearance="outline"
            onPress={() => setIsAdvancedOpen((current) => !current)}
            aria-expanded={isAdvancedOpen}
            className="justify-center"
          >
            <Filter size={16} aria-hidden="true" />
            Bộ lọc nâng cao
            {activeFilterCount > 0 && (
              <Badge color="primary">{activeFilterCount}</Badge>
            )}
          </Button>
        </div>
      </div>

      {isAdvancedOpen && (
        <div className="mt-4 grid gap-4 border-t border-card-border pt-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-1.5 text-sm font-medium text-text-primary">
            Mức độ
            <select
              value={value.severity ?? ""}
              onChange={(event) => update("severity", event.target.value)}
              className="h-10 w-full rounded-lg border border-input-border bg-input-background px-3 text-sm text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <option value="">Tất cả mức độ</option>
              <option value="critical">Cần chú ý</option>
              <option value="info">Thông tin</option>
            </select>
          </label>
          <label className="space-y-1.5 text-sm font-medium text-text-primary">
            <span className="flex items-center gap-1">
              Vai trò hiện tại
              <span
                title="Lọc theo vai trò hiện tại của người dùng, không phải vai trò tại thời điểm thực hiện hành động."
                aria-label="Lọc theo vai trò hiện tại của người dùng, không phải vai trò tại thời điểm thực hiện hành động."
                className="inline-flex size-4 cursor-help items-center justify-center rounded-full border border-card-border text-[10px] text-text-tertiary"
              >
                i
              </span>
            </span>
            <select
              value={value.role ?? ""}
              onChange={(event) => update("role", event.target.value)}
              className="h-10 w-full rounded-lg border border-input-border bg-input-background px-3 text-sm text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <option value="">Tất cả vai trò</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5 text-sm font-medium text-text-primary">
            Từ ngày
            <input
              type="date"
              value={value.startDate ?? ""}
              onChange={(event) => update("startDate", event.target.value)}
              className="h-10 w-full rounded-lg border border-input-border bg-input-background px-3 text-sm text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            />
          </label>
          <label className="space-y-1.5 text-sm font-medium text-text-primary">
            Đến ngày
            <input
              type="date"
              value={value.endDate ?? ""}
              onChange={(event) => update("endDate", event.target.value)}
              className="h-10 w-full rounded-lg border border-input-border bg-input-background px-3 text-sm text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            />
          </label>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-text-tertiary">
          {activeFilterCount > 0
            ? `${activeFilterCount} bộ lọc đang áp dụng.`
            : "Mặc định hiển thị hoạt động trong 7 ngày gần nhất."}
        </p>
        {activeFilterCount > 0 && (
          <Button
            size="xs"
            appearance="ghost"
            onPress={() => onChange({})}
            className="gap-1.5 text-text-secondary hover:text-text-primary"
          >
            <Close size={14} aria-hidden="true" />
            Xóa bộ lọc
          </Button>
        )}
      </div>
    </AdminTableFrame>
  );
}
