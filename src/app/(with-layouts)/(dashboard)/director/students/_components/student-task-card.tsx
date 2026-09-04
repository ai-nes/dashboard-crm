"use client";

import { Calendar, Check, ChevronDown, ChevronRight, Trash1 } from "@tailgrids/icons";
import type { ReactNode } from "react";
import { useState } from "react";

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
import type { StudentTaskItem } from "@/services/api/students/types";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/format-date";

import StudentInlineEditableRichText from "./student-inline-editable-rich-text";
import StudentInlineEditableText from "./student-inline-editable-text";
import {
  StudentTaskPriority,
  StudentTaskStatusBadge,
  taskStatusLabel,
} from "./student-task-badges";

interface StudentTaskCardProps {
  task: StudentTaskItem;
  onUpdateTask: (id: string, updates: Partial<StudentTaskItem>) => void;
  onDeleteTask?: (id: string) => void;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

const priorityOptions: StudentTaskItem["priority"][] = ["Cao", "Trung bình", "Thấp"];
const statusOptions: Array<{
  value: StudentTaskItem["status"];
  label: string;
}> = [
  { value: "todo", label: taskStatusLabel.todo },
  { value: "in-progress", label: taskStatusLabel["in-progress"] },
  { value: "done", label: taskStatusLabel.done },
  { value: "canceled", label: taskStatusLabel.canceled },
];
function toDateInputValue(value: string): string {
  const ddmmyyyy = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    return `${year}-${month}-${day}`;
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

function fromDateInputValue(value: string): string {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

export function isTaskOverdue(task: StudentTaskItem): boolean {
  if (task.status === "done" || task.status === "canceled") return false;
  const dueDate = toDateInputValue(task.dueDate);
  if (!dueDate) return false;
  return new Date(`${dueDate}T${task.dueTime || "23:59"}`).getTime() < Date.now();
}

function formatTaskDeadline(task: StudentTaskItem): string {
  const date = formatDate(task.dueDate);
  return task.dueTime ? `${date} · ${task.dueTime}` : date;
}

export default function StudentTaskCard({
  task,
  onUpdateTask,
  onDeleteTask,
  defaultExpanded = true,
  expanded: expandedProp,
  onExpandedChange,
}: StudentTaskCardProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const expanded = expandedProp ?? internalExpanded;
  const overdue = isTaskOverdue(task);

  const toggleExpanded = () => {
    const nextExpanded = !expanded;
    if (expandedProp === undefined) setInternalExpanded(nextExpanded);
    onExpandedChange?.(nextExpanded);
  };

  return (
    <article id={`student-task-${task.id}`} className="overflow-hidden rounded-xl border border-card-border bg-card-background shadow-sm">
      <div className="flex items-center justify-between gap-3 bg-background-gray-secondary/30 px-4 py-4 sm:px-5">
        <button
          type="button"
          onClick={toggleExpanded}
          aria-expanded={expanded}
          className="flex items-center gap-2 rounded-md text-left text-base font-semibold text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <span>Task</span>
          <span className="hidden text-sm font-medium text-text-secondary sm:inline">
            · {task.assignee || "Chưa phân công"}
          </span>
        </button>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 text-sm",
              overdue ? "font-medium text-badge-cyan-text" : "text-text-tertiary",
            )}
          >
            <Calendar size={14} aria-hidden="true" />
            {overdue ? "Quá hạn" : "Hạn"}: {formatTaskDeadline(task)}
          </span>
          {onDeleteTask && (
            <Button
              iconOnly
              size="sm"
              variant="ghost"
              appearance="ghost"
              aria-label={`Xóa task ${task.title}`}
              className="text-text-tertiary hover:text-error-500"
              onPress={() => onDeleteTask(task.id)}
            >
              <Trash1 size={15} aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>

      {!expanded && (
        <div className="flex items-center gap-3 border-t border-card-border px-4 py-5 sm:px-5">
          <TaskQuickStatusButton
            status={task.status}
            overdue={overdue}
            onPress={() => onUpdateTask(task.id, { status: getNextQuickStatus(task.status) })}
          />
          <span
            className={cn(
              "min-w-0 truncate text-base font-semibold text-text-primary",
              (task.status === "done" || task.status === "canceled") &&
                "text-text-tertiary line-through",
            )}
          >
            {task.title}
          </span>
        </div>
      )}

      {expanded && (
        <div className="border-t border-card-border px-4 pb-5 sm:px-5">
          <div className="flex items-start gap-3 border-b border-card-border py-5">
            <TaskQuickStatusButton
              status={task.status}
              overdue={overdue}
              onPress={() => onUpdateTask(task.id, { status: getNextQuickStatus(task.status) })}
            />
            <StudentInlineEditableText
              value={task.title}
              onCommit={(title) => onUpdateTask(task.id, { title })}
              strikethrough={task.status === "done" || task.status === "canceled"}
              textClassName="text-lg font-semibold sm:text-xl"
              className="min-w-0 flex-1"
            />
          </div>

          <div className="grid gap-4 border-b border-card-border py-5 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <FieldGroup label="Hạn xử lý">
              <Input
                type="date"
                value={toDateInputValue(task.dueDate)}
                onChange={(event) =>
                  onUpdateTask(task.id, { dueDate: fromDateInputValue(event.target.value) })
                }
                aria-label="Hạn xử lý"
                className="h-10 font-medium text-sm shadow-xs"
              />
            </FieldGroup>
            <FieldGroup label="Giờ xử lý">
              <Input
                type="time"
                value={task.dueTime ?? ""}
                onChange={(event) => onUpdateTask(task.id, { dueTime: event.target.value })}
                aria-label="Giờ xử lý"
                className="h-10 font-medium text-sm shadow-xs"
              />
            </FieldGroup>
          </div>

          <div className="grid gap-x-8 gap-y-5 rounded-lg border border-card-border bg-background-gray-secondary/30 px-4 py-5 sm:grid-cols-2 xl:grid-cols-4">
            <FieldGroup label="Trạng thái">
              <Select
                value={task.status}
                onChange={(key) => {
                  const nextStatus = statusOptions.find(
                    (option) => option.value === String(key),
                  )?.value;
                  if (nextStatus) onUpdateTask(task.id, { status: nextStatus });
                }}
                aria-label="Trạng thái task"
              >
                <SelectTrigger
                  size="sm"
                  className="w-fit border-0 bg-transparent p-0 shadow-none hover:bg-transparent focus:ring-0"
                >
                  <StudentTaskStatusBadge status={task.status} />
                  <SelectValue className="sr-only" />
                  <SelectIndicator className="ml-1 text-text-primary" />
                </SelectTrigger>
                <SelectContent className="min-w-44">
                  {statusOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      id={option.value}
                      textValue={option.label}
                      className="py-2 whitespace-nowrap"
                    >
                      <StudentTaskStatusBadge status={option.value} />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldGroup>

            <FieldGroup label="Mức ưu tiên">
              <Select
                value={task.priority}
                onChange={(key) =>
                  onUpdateTask(task.id, {
                    priority: String(key) as StudentTaskItem["priority"],
                  })
                }
                aria-label="Mức ưu tiên"
              >
                <SelectTrigger
                  size="sm"
                  className="w-fit min-w-0 border-0 bg-transparent p-0 shadow-none hover:bg-transparent focus:ring-0"
                >
              <StudentTaskPriority priority={task.priority} />
                  <SelectValue className="sr-only" />
                  <SelectIndicator className="ml-1 text-text-primary" />
                </SelectTrigger>
                <SelectContent className="min-w-44">
                  {priorityOptions.map((option) => (
                    <SelectItem
                      key={option}
                      id={option}
                      textValue={option}
                      className="py-2 whitespace-nowrap"
                    >
                      <StudentTaskPriority priority={option} />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldGroup>

            <FieldGroup label="Người phụ trách">
              <span className="text-base font-semibold text-text-primary">
                {task.assignee || "Chưa phân công"}
              </span>
            </FieldGroup>
          </div>

          <div className="mt-5 border-t border-card-border pt-5">
            <p className="mb-2 text-sm font-medium text-text-100">Ghi chú task</p>
            <StudentInlineEditableRichText
              value={task.notes ?? ""}
              onCommit={(notes) => onUpdateTask(task.id, { notes })}
              placeholder="Thêm ghi chú cho task..."
            />
          </div>
        </div>
      )}
    </article>
  );
}

function FieldGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="text-sm font-medium text-text-100">{label}</span>
      {children}
    </div>
  );
}

interface TaskQuickStatusButtonProps {
  status: StudentTaskItem["status"];
  overdue: boolean;
  onPress: () => void;
}

function TaskQuickStatusButton({ status, overdue, onPress }: TaskQuickStatusButtonProps) {
  return (
    <Button
      variant="success"
      appearance={status === "done" ? "fill" : "outline"}
      iconOnly
      size="sm"
      onPress={onPress}
      aria-label={
        status === "done"
          ? "Đánh dấu chưa hoàn thành"
          : status === "canceled"
            ? "Khôi phục task"
            : "Đánh dấu hoàn thành"
      }
      className={cn(
        "size-10 shrink-0 rounded-full",
        status !== "done" && "bg-card-background text-text-secondary",
        overdue && status !== "done" && "border-error-500 text-text-secondary",
      )}
    >
      <Check size={18} />
    </Button>
  );
}

function getNextQuickStatus(
  status: StudentTaskItem["status"],
): StudentTaskItem["status"] {
  return status === "done" || status === "canceled" ? "todo" : "done";
}
