"use client";

import StudentActivityToolbar, {
  ActivityFilterSelect,
  type ActivityExpansionMode,
  type ActivityFilterOption,
} from "./student-activity-toolbar";
import {
  activityTimeFilterOptions,
  type ActivityTimeFilter,
} from "./student-activity-utils";

export type AuditActionFilter = "all" | "created" | "updated" | "deleted";

interface StudentAuditFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  timeFilter: ActivityTimeFilter;
  onTimeFilterChange: (value: ActivityTimeFilter) => void;
  actionFilter: AuditActionFilter;
  onActionFilterChange: (value: AuditActionFilter) => void;
  expansionMode: ActivityExpansionMode;
  onExpansionModeChange: (value: ActivityExpansionMode) => void;
}

const actionFilterOptions: ActivityFilterOption[] = [
  { id: "all", label: "Tất cả thao tác" },
  { id: "created", label: "Tạo hồ sơ" },
  { id: "updated", label: "Cập nhật" },
  { id: "deleted", label: "Xóa / Khôi phục" },
];

export default function StudentAuditFilters({
  search,
  onSearchChange,
  timeFilter,
  onTimeFilterChange,
  actionFilter,
  onActionFilterChange,
  expansionMode,
  onExpansionModeChange,
}: StudentAuditFiltersProps) {
  return (
    <div className="space-y-3">
      <StudentActivityToolbar
        search={search}
        onSearchChange={onSearchChange}
        searchPlaceholder="Tìm theo người thực hiện, thao tác, trường dữ liệu..."
        searchLabel="Tìm kiếm nhật ký"
        expansionMode={expansionMode}
        onExpansionModeChange={onExpansionModeChange}
      />

      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        <div className="min-w-36">
          <ActivityFilterSelect
            ariaLabel="Lọc theo thời gian"
            triggerLabel="Tất cả thời gian"
            value={timeFilter}
            options={activityTimeFilterOptions}
            onChange={(value) => onTimeFilterChange(value as ActivityTimeFilter)}
          />
        </div>
        <span className="text-text-tertiary/40" aria-hidden="true">·</span>
        <div className="min-w-36">
          <ActivityFilterSelect
            ariaLabel="Lọc theo loại thao tác"
            triggerLabel="Tất cả thao tác"
            value={actionFilter}
            options={actionFilterOptions}
            onChange={(value) => onActionFilterChange(value as AuditActionFilter)}
          />
        </div>
      </div>
    </div>
  );
}

