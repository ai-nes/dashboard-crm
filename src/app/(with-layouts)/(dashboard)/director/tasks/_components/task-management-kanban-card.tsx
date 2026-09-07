"use client";

import type { KeyboardEvent, MouseEvent } from "react";
import { useDraggable } from "@dnd-kit/react";
import { CalendarTime } from "@tailgrids/icons";

import type { TaskManagementItem } from "@/services/api/tasks/types";
import type { StudentTaskItem } from "@/services/api/students/types";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/format-date";

import {
  StudentTaskPriority,
  StudentTaskTypeBadge,
} from "../../students/_components/student-task-badges";
import TaskManagementKanbanTitleEditor from "./task-management-kanban-title-editor";
import TaskManagementTaskActions from "./task-management-task-actions";

interface TaskManagementKanbanCardProps {
  task: TaskManagementItem;
  onOpenTask: (task: TaskManagementItem) => void;
  onUpdateTask: (
    id: string,
    updates: Partial<StudentTaskItem>,
  ) => void | Promise<void>;
  onDeleteTask?: (id: string) => void;
}

function isOverdue(task: TaskManagementItem): boolean {
  if (task.status === "done" || task.status === "canceled") return false;

  const ddmmyyyy = task.dueDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  const date = ddmmyyyy
    ? `${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`
    : task.dueDate;

  return new Date(`${date}T${task.dueTime || "23:59"}`).getTime() < Date.now();
}

function getAssigneeInitials(name?: string): string {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length === 0) return "--";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts.at(-1)?.[0] ?? ""}`.toUpperCase();
}

function TaskDeadline({ task }: { task: TaskManagementItem }) {
  const overdue = isOverdue(task);

  return (
    <div
      className={cn(
        "flex min-w-0 items-start gap-1.5 text-xs",
        overdue ? "font-semibold text-error-500" : "text-text-secondary",
      )}
      aria-label={`${overdue ? "Quá hạn" : "Hạn xử lý"}: ${formatDate(task.dueDate)}${task.dueTime ? `, ${task.dueTime}` : ""}`}
    >
      <CalendarTime size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
      <span className="min-w-0 truncate">
        {overdue && <span className="mr-1">Quá hạn ·</span>}
        {formatDate(task.dueDate)}
        {task.dueTime && <span className="text-[11px]"> · {task.dueTime}</span>}
      </span>
    </div>
  );
}

export default function TaskManagementKanbanCard({
  task,
  onOpenTask,
  onUpdateTask,
  onDeleteTask,
}: TaskManagementKanbanCardProps) {
  const { isDragging, handleRef, ref } = useDraggable({
    id: `task-${task.id}`,
    data: { taskId: task.id },
  });
  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest("button, a")) return;
    onOpenTask(task);
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    onOpenTask(task);
  };

  return (
    <article
      ref={ref}
      role="listitem"
      tabIndex={0}
      aria-label={`Xem chi tiết task của ${task.studentName}`}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      className={`group cursor-pointer rounded-lg border border-card-border bg-card-background p-3.5 outline-none shadow-xs transition-[border-color,box-shadow,transform] hover:-translate-y-px hover:border-primary-300 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-primary-500 ${
        isDragging ? "opacity-60 ring-2 ring-primary-500" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1">
          <button
            ref={handleRef}
            type="button"
            aria-label={`Kéo task của ${task.studentName} để chuyển trạng thái`}
            title="Kéo để chuyển trạng thái"
            className="flex size-7 shrink-0 cursor-grab items-center justify-center rounded-md text-base leading-none text-text-tertiary outline-none transition hover:bg-background-soft-50 hover:text-text-primary active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <span aria-hidden="true">⠿</span>
          </button>
          <StudentTaskTypeBadge
            actionCode={task.actionCode}
            taskType={task.taskType}
            size="sm"
          />
        </div>
        <TaskManagementTaskActions
          task={task}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
        />
      </div>

      <TaskManagementKanbanTitleEditor
        title={task.title}
        onSave={(title) => onUpdateTask(task.id, { title })}
      />

      <div className="mt-3">
        <TaskDeadline task={task} />
      </div>
      <div className="mt-2.5 flex min-w-0 items-center justify-between gap-2 border-t border-card-border pt-2.5">
        <div
          className="flex min-w-0 items-center gap-2 text-xs text-text-secondary"
          title={task.assignee || "Chưa phân công"}
        >
          <span
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-background-gray-secondary text-[10px] font-semibold text-text-secondary"
            aria-label={`Người phụ trách: ${task.assignee || "Chưa phân công"}`}
          >
            {getAssigneeInitials(task.assignee)}
          </span>
          <span className="max-w-[12rem] truncate">
            {task.assignee || "Chưa phân công"}
          </span>
        </div>
        <StudentTaskPriority priority={task.priority} size="sm" />
      </div>
    </article>
  );
}
