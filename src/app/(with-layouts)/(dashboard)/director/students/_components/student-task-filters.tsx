"use client";

import type { StudentTaskItem } from "@/services/api/students/types";

import StudentActivityToolbar, {
  ActivityFilterSelect,
  type ActivityExpansionMode,
  type ActivityFilterOption,
} from "./student-activity-toolbar";
import {
  activityTimeFilterOptions,
  type ActivityTimeFilter,
} from "./student-activity-utils";
import { taskStatusLabel } from "./student-task-badges";

export type TaskTimeFilter = ActivityTimeFilter;

export type TaskPriorityFilter = "all" | StudentTaskItem["priority"];
export type TaskExpansionMode = ActivityExpansionMode;

interface StudentTaskFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  timeFilter: TaskTimeFilter;
  onTimeFilterChange: (value: TaskTimeFilter) => void;
  statusFilter: "all" | StudentTaskItem["status"];
  onStatusFilterChange: (value: "all" | StudentTaskItem["status"]) => void;
  priorityFilter: TaskPriorityFilter;
  onPriorityFilterChange: (value: TaskPriorityFilter) => void;
  expansionMode: TaskExpansionMode;
  onExpansionModeChange: (value: TaskExpansionMode) => void;
  onCreateTask: () => void;
}

const statusFilterOptions: ActivityFilterOption[] = [
  { id: "all", label: "Tất cả trạng thái" },
  { id: "todo", label: taskStatusLabel.todo },
  { id: "in-progress", label: taskStatusLabel["in-progress"] },
  { id: "done", label: taskStatusLabel.done },
];

const priorityFilterOptions: ActivityFilterOption[] = [
  { id: "all", label: "Tất cả mức ưu tiên" },
  { id: "Cao", label: "Cao" },
  { id: "Trung bình", label: "Trung bình" },
  { id: "Thấp", label: "Thấp" },
];

export default function StudentTaskFilters({
  search,
  onSearchChange,
  timeFilter,
  onTimeFilterChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  expansionMode,
  onExpansionModeChange,
  onCreateTask,
}: StudentTaskFiltersProps) {
  return (
    <div className="space-y-4">
      <StudentActivityToolbar
        search={search}
        onSearchChange={onSearchChange}
        searchPlaceholder="Tìm task..."
        searchLabel="Tìm task"
        expansionMode={expansionMode}
        onExpansionModeChange={onExpansionModeChange}
        onCreate={onCreateTask}
        createLabel="Tạo task"
      />

      <div className="grid w-full max-w-md grid-cols-3 items-center gap-x-2">
        <ActivityFilterSelect
          ariaLabel="Lọc theo thời gian"
          triggerLabel="Tất cả thời gian"
          value={timeFilter}
          options={activityTimeFilterOptions}
          onChange={(value) => onTimeFilterChange(value as TaskTimeFilter)}
        />
        <ActivityFilterSelect
          ariaLabel="Lọc theo trạng thái"
          triggerLabel="Trạng thái task"
          value={statusFilter}
          options={statusFilterOptions}
          onChange={(value) =>
            onStatusFilterChange(value as "all" | StudentTaskItem["status"])
          }
        />
        <ActivityFilterSelect
          ariaLabel="Lọc theo mức ưu tiên"
          triggerLabel="Mức ưu tiên"
          value={priorityFilter}
          options={priorityFilterOptions}
          onChange={(value) => onPriorityFilterChange(value as TaskPriorityFilter)}
        />
      </div>
    </div>
  );
}
