"use client";

import { Calendar, User2 } from "@tailgrids/icons";
import type { ReactNode } from "react";

import { DatePickerField } from "@/components/common/date-picker-field";
import { TimePickerField } from "@/components/common/time-picker-field";
import { TaskActionSelect } from "@/components/common/task-action-select";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import type {
  StudentPriority,
  StudentTaskItem,
} from "@/services/api/students/types";
import { cn } from "@/utils/cn";
import { taskStatusLabel } from "../../students/_components/student-task-badges";

export interface TaskDialogSidebarProps {
  status: StudentTaskItem["status"];
  onStatusChange?: (status: StudentTaskItem["status"]) => void;
  assigneeName?: string;
  parentLabel?: string;
  hideAssignee?: boolean;
  parentField?: ReactNode;
  priority: StudentPriority;
  onPriorityChange?: (priority: StudentPriority) => void;
  actionCode: string;
  onActionCodeChange?: (actionCode: string) => void;
  dueDate: string;
  onDueDateChange?: (dueDate: string) => void;
  dueTime: string;
  onDueTimeChange?: (dueTime: string) => void;
  className?: string;
}

const priorityOptions: StudentPriority[] = ["Cao", "Trung bình", "Thấp"];

const priorityDotClass: Record<StudentPriority, string> = {
  Cao: "bg-badge-error-icon-color",
  "Trung bình": "bg-badge-warning-icon-color",
  Thấp: "bg-badge-success-icon-color",
};

const statusOptions: StudentTaskItem["status"][] = [
  "todo",
  "in-progress",
  "done",
  "canceled",
];

const statusDotClass: Record<StudentTaskItem["status"], string> = {
  todo: "bg-badge-neutral-icon-color",
  "in-progress": "bg-badge-blue-icon-color",
  done: "bg-badge-success-icon-color",
  canceled: "bg-badge-error-icon-color",
};

const jiraStatusStyle: Record<StudentTaskItem["status"], string> = {
  todo: "bg-badge-neutral-background text-badge-neutral-text border-card-border hover:bg-background-soft-100",
  "in-progress":
    "bg-badge-blue-background text-badge-blue-text border-blue-300 hover:bg-badge-blue-background/80",
  done: "bg-badge-success-background text-badge-success-text border-green-300 hover:bg-badge-success-background/80",
  canceled:
    "bg-badge-error-background text-badge-error-text border-red-300 hover:bg-badge-error-background/80",
};

function getInitials(name?: string): string {
  if (!name || name === "Chưa phân công") return "--";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "--";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts.at(-1)?.[0] ?? ""}`.toUpperCase();
}

export default function TaskDialogSidebar({
  status,
  onStatusChange,
  assigneeName = "Chưa phân công",
  parentLabel = "Học sinh *",
  hideAssignee = false,
  parentField,
  priority,
  onPriorityChange,
  actionCode,
  onActionCodeChange,
  dueDate,
  onDueDateChange,
  dueTime,
  onDueTimeChange,
  className,
}: TaskDialogSidebarProps) {
  return (
    <aside
      className={cn(
        "flex flex-col gap-3.5 text-xs text-text-secondary",
        className,
      )}
    >
      {/* Details Section - luôn hiển thị */}
      <div className="rounded-lg border border-card-border bg-card-background">
        <div className="border-b border-card-border px-3.5 py-2.5">
          <span className="text-xs font-semibold text-text-primary">
            Chi tiết
          </span>
        </div>

        <div className="divide-y divide-card-border/60 p-3">
          {/* Trạng thái */}
          <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-2 py-2">
            <span className="font-medium text-text-secondary">Trạng thái</span>
            <div className="min-w-0">
              {onStatusChange ? (
                <Select
                  value={status}
                  onChange={(value) =>
                    onStatusChange(String(value) as StudentTaskItem["status"])
                  }
                  aria-label="Trạng thái task"
                >
                  <SelectTrigger
                    className={cn(
                      "h-9 w-full rounded-lg border px-3 text-xs font-semibold shadow-none transition-colors",
                      jiraStatusStyle[status],
                    )}
                  >
                    <SelectValue />
                    <SelectIndicator className="ml-auto [&>svg]:size-3" />
                  </SelectTrigger>
                  <SelectContent className="min-w-[180px]">
                    {statusOptions.map((option) => (
                      <SelectItem
                        key={option}
                        id={option}
                        textValue={taskStatusLabel[option]}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "size-2 rounded-full",
                              statusDotClass[option],
                            )}
                          />
                          <span>{taskStatusLabel[option]}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <span
                  className={cn(
                    "flex h-9 w-full items-center rounded-lg border px-3 text-xs font-semibold",
                    jiraStatusStyle[status],
                  )}
                >
                  {taskStatusLabel[status]}
                </span>
              )}
            </div>
          </div>

          {/* Mức ưu tiên */}
          <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-2 py-2">
            <span className="font-medium text-text-secondary">Mức ưu tiên</span>
            {onPriorityChange ? (
              <Select
                value={priority}
                onChange={(value) =>
                  onPriorityChange(String(value) as StudentPriority)
                }
                aria-label="Chọn mức ưu tiên"
              >
                <SelectTrigger className="h-9 w-full rounded-lg border border-card-border bg-card-background px-3 text-sm font-medium shadow-xs hover:border-card-border-hover">
                  <SelectValue />
                  <SelectIndicator className="ml-auto [&>svg]:size-3.5" />
                </SelectTrigger>
                <SelectContent className="min-w-[200px]">
                  {priorityOptions.map((option) => (
                    <SelectItem key={option} id={option} textValue={option}>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "size-2 rounded-full",
                            priorityDotClass[option],
                          )}
                        />
                        <span>{option}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex h-9 w-full items-center gap-2 rounded-lg border border-card-border bg-card-background px-3 text-sm font-medium text-text-primary shadow-xs">
                <span
                  className={cn(
                    "size-2 rounded-full",
                    priorityDotClass[priority],
                  )}
                />
                <span>{priority}</span>
              </div>
            )}
          </div>

          {/* Hồ sơ học sinh */}
          <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-2 py-2">
            <span className="font-medium text-text-secondary">{parentLabel}</span>
            <div className="min-w-0">
              {parentField ? (
                parentField
              ) : (
                <span className="flex h-9 w-full items-center px-0 text-sm text-text-tertiary">
                  Chưa chọn học sinh
                </span>
              )}
            </div>
          </div>

          {/* Người phụ trách */}
          {!hideAssignee && (
            <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-2 py-2">
              <span className="font-medium text-text-secondary">
                Người phụ trách
              </span>
              <div className="space-y-1">
                <div className="flex h-9 items-center gap-2 text-sm font-medium text-text-primary">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">
                    {assigneeName === "Chưa phân công" ? (
                      <User2 size={12} />
                    ) : (
                      getInitials(assigneeName)
                    )}
                  </span>
                  <span className="truncate text-sm font-medium text-text-primary">
                    {assigneeName}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Loại task */}
          <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-2 py-2">
            <span className="font-medium text-text-secondary">Loại task *</span>
            <div className="min-w-0">
              {onActionCodeChange ? (
                <TaskActionSelect
                  hideLabel
                  value={actionCode}
                  onChange={onActionCodeChange}
                />
              ) : (
                <span className="flex h-9 w-full items-center px-0 text-sm font-medium text-text-primary">
                  {actionCode || "None"}
                </span>
              )}
            </div>
          </div>

          {/* Hạn xử lý */}
          <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-2 py-2">
            <span className="font-medium text-text-secondary">Hạn xử lý *</span>
            <div className="min-w-0">
              {onDueDateChange ? (
                <DatePickerField
                  ariaLabel="Hạn xử lý"
                  value={dueDate}
                  onChange={onDueDateChange}
                />
              ) : (
                <span className="flex h-9 w-full items-center gap-1.5 rounded-lg border border-card-border bg-card-background px-3 text-sm font-medium text-text-primary shadow-xs">
                  <Calendar size={14} className="text-text-tertiary" />
                  <span>{dueDate || "Chọn ngày"}</span>
                </span>
              )}
            </div>
          </div>

          {/* Giờ xử lý */}
          <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-2 py-2">
            <span className="font-medium text-text-secondary">Giờ xử lý *</span>
            <div className="min-w-0">
              {onDueTimeChange ? (
                <TimePickerField
                  ariaLabel="Giờ xử lý"
                  value={dueTime}
                  onChange={onDueTimeChange}
                />
              ) : (
                <span className="flex h-9 w-full items-center rounded-lg border border-card-border bg-card-background px-3 text-sm font-medium text-text-primary shadow-xs">
                  {dueTime || "09:00"}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
