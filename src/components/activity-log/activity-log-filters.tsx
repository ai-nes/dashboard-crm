"use client";

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

export default function ActivityLogFilters({
  value,
  onChange,
}: ActivityLogFiltersProps) {
  const update = (field: keyof ActivityLogFilterState, nextValue: string) =>
    onChange({ ...value, [field]: nextValue || undefined });

  return (
    <section
      className="rounded-xl border border-card-border bg-card-background p-4"
      aria-label="Bộ lọc nhật ký"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <label className="space-y-1.5 text-sm font-medium text-text-primary">
          Người thực hiện
          <input
            value={value.actor ?? ""}
            onChange={(event) => update("actor", event.target.value)}
            placeholder="Tên hoặc email người thực hiện"
            className="h-10 w-full rounded-lg border border-input-border bg-input-background px-3 text-sm text-text-primary outline-none placeholder:text-input-placeholder-text focus-visible:ring-2 focus-visible:ring-primary-500"
          />
        </label>
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
            Role hiện tại
            <span
              title="Lọc theo role hiện tại của user, không phải role tại thời điểm thực hiện hành động."
              aria-label="Lọc theo role hiện tại của user, không phải role tại thời điểm thực hiện hành động."
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
            <option value="">Tất cả role</option>
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
      <p className="mt-3 text-xs text-text-tertiary">
        Mặc định hiển thị hoạt động trong 7 ngày gần nhất.
      </p>
    </section>
  );
}
