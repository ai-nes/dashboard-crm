"use client";

import { Plus, Search1 } from "@tailgrids/icons";

import { Button } from "@/components/tailgrids/core/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/tailgrids/core/input-group";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import { taskStatusLabel, taskTypeLabel } from "../../students/_components/student-task-badges";
import type { TaskPriorityFilter, TaskSort, TaskStatusFilter, TaskTypeFilter, TaskView } from "./types";

interface TaskManagementToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  view: TaskView;
  onViewChange: (value: TaskView) => void;
  status: TaskStatusFilter;
  onStatusChange: (value: TaskStatusFilter) => void;
  priority: TaskPriorityFilter;
  onPriorityChange: (value: TaskPriorityFilter) => void;
  taskType: TaskTypeFilter;
  onTaskTypeChange: (value: TaskTypeFilter) => void;
  sort: TaskSort;
  onSortChange: (value: TaskSort) => void;
  onResetFilters: () => void;
  resultCount: number;
  totalCount: number;
  onCreateTask: () => void;
}

const views: { id: TaskView; label: string }[] = [
  { id: "all", label: "Tất cả task" },
  { id: "today", label: "Hôm nay" },
  { id: "overdue", label: "Quá hạn" },
  { id: "upcoming", label: "Sắp tới" },
];

const statuses: { id: TaskStatusFilter; label: string }[] = [
  { id: "all", label: "Tất cả trạng thái" },
  { id: "todo", label: taskStatusLabel.todo },
  { id: "in-progress", label: taskStatusLabel["in-progress"] },
  { id: "done", label: taskStatusLabel.done },
];

const priorities: { id: TaskPriorityFilter; label: string }[] = [
  { id: "all", label: "Tất cả ưu tiên" },
  { id: "Cao", label: "Cao" },
  { id: "Trung bình", label: "Trung bình" },
  { id: "Thấp", label: "Thấp" },
];

const taskTypes: { id: TaskTypeFilter; label: string }[] = [
  { id: "all", label: "Tất cả loại task" },
  { id: "call", label: taskTypeLabel.call },
  { id: "email", label: taskTypeLabel.email },
  { id: "todo", label: taskTypeLabel.todo },
];

const sorts: { id: TaskSort; label: string }[] = [
  { id: "due-asc", label: "Hạn xử lý gần nhất" },
  { id: "due-desc", label: "Hạn xử lý xa nhất" },
  { id: "priority", label: "Mức ưu tiên" },
  { id: "student", label: "Tên học sinh" },
];

export default function TaskManagementToolbar({
  search,
  onSearchChange,
  view,
  onViewChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  taskType,
  onTaskTypeChange,
  sort,
  onSortChange,
  onResetFilters,
  resultCount,
  totalCount,
  onCreateTask,
}: TaskManagementToolbarProps) {
  const activeFilterCount = [status !== "all", priority !== "all", taskType !== "all"].filter(Boolean).length;

  return (
    <div className="space-y-4 border-b border-card-border p-4 lg:p-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3 md:flex-row md:items-center">
          <InputGroup className="min-w-0 md:max-w-sm">
            <InputGroupInput
              aria-label="Tìm task"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Tìm task, học sinh, người phụ trách..."
            />
            <InputGroupAddon align="inline-end">
              <Search1 size={18} aria-hidden="true" />
            </InputGroupAddon>
          </InputGroup>
          <div className="flex items-center gap-2">
            <Select
              value={sort}
              onChange={(value) => onSortChange(String(value) as TaskSort)}
              aria-label="Sắp xếp task"
            >
              <SelectTrigger size="sm" className="min-w-44">
                <SelectValue />
                <SelectIndicator />
              </SelectTrigger>
              <SelectContent>
                {sorts.map((option) => (
                  <SelectItem key={option.id} id={option.id} textValue={option.label}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 xl:justify-end">
          <p className="text-xs text-text-tertiary">
            <span className="font-semibold text-text-primary">{resultCount}</span> task
            {resultCount !== totalCount && <span> · {totalCount} tổng</span>}
          </p>
          <Button size="sm" onPress={onCreateTask}>
            <Plus size={16} aria-hidden="true" />
            Tạo task
          </Button>
        </div>
      </div>

      <nav aria-label="Nhóm task" className="flex gap-1 overflow-x-auto [scrollbar-width:thin]">
        {views.map((item) => {
          const selected = item.id === view;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onViewChange(item.id)}
              className={
                selected
                  ? "shrink-0 rounded-md bg-background-gray-secondary_alt px-3 py-2 text-sm font-semibold text-text-primary"
                  : "shrink-0 rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition hover:bg-background-soft-50 hover:text-text-primary"
              }
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="grid gap-3 md:grid-cols-3">
          <Select
            value={status}
            onChange={(value) => onStatusChange(String(value) as TaskStatusFilter)}
            aria-label="Lọc theo trạng thái"
          >
            <SelectTrigger size="sm" className="w-full">
              <SelectValue />
              <SelectIndicator />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((option) => (
                <SelectItem key={option.id} id={option.id} textValue={option.label}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={priority}
            onChange={(value) => onPriorityChange(String(value) as TaskPriorityFilter)}
            aria-label="Lọc theo mức ưu tiên"
          >
            <SelectTrigger size="sm" className="w-full">
              <SelectValue />
              <SelectIndicator />
            </SelectTrigger>
            <SelectContent>
              {priorities.map((option) => (
                <SelectItem key={option.id} id={option.id} textValue={option.label}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Select
              value={taskType}
              onChange={(value) => onTaskTypeChange(String(value) as TaskTypeFilter)}
              aria-label="Lọc theo loại task"
            >
              <SelectTrigger size="sm" className="w-full">
                <SelectValue />
                <SelectIndicator />
              </SelectTrigger>
              <SelectContent>
                {taskTypes.map((option) => (
                  <SelectItem key={option.id} id={option.id} textValue={option.label}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {activeFilterCount > 0 && (
              <Button size="sm" variant="ghost" appearance="ghost" onPress={onResetFilters}>
                Xóa
              </Button>
            )}
          </div>
      </div>
    </div>
  );
}
