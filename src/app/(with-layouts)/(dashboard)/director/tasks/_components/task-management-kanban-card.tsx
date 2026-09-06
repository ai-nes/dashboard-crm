"use client";

import { useDraggable } from "@dnd-kit/react";
import Link from "next/link";
import { CalendarTime, Trash1 } from "@tailgrids/icons";

import { Button } from "@/components/tailgrids/core/button";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import type { StudentTaskItem } from "@/services/api/students/types";
import type { TaskManagementItem } from "@/services/api/tasks/types";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/format-date";

import {
  StudentTaskPriority,
  StudentTaskStatusBadge,
  taskStatusLabel,
  taskTypeLabel,
} from "../../students/_components/student-task-badges";

interface TaskManagementKanbanCardProps {
  task: TaskManagementItem;
  onUpdateTask: (
    id: string,
    updates: Partial<StudentTaskItem>,
  ) => void | Promise<void>;
  onDeleteTask?: (id: string) => void;
}

const statusOptions: StudentTaskItem["status"][] = [
  "todo",
  "in-progress",
  "done",
  "canceled",
];

function isOverdue(task: TaskManagementItem): boolean {
  if (task.status === "done" || task.status === "canceled") return false;

  const ddmmyyyy = task.dueDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  const date = ddmmyyyy
    ? `${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`
    : task.dueDate;

  return new Date(`${date}T${task.dueTime || "23:59"}`).getTime() < Date.now();
}

function taskHref(task: TaskManagementItem): string {
  return `/director/students/${task.studentId}?tab=activities&taskId=${task.id}`;
}

function TaskStudentSummary({ task }: { task: TaskManagementItem }) {
  return (
    <Link
      href={taskHref(task)}
      className="flex min-w-0 items-center gap-2 rounded-md text-text-primary outline-none hover:text-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500"
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-badge-primary-background text-[11px] font-semibold text-badge-primary-text">
        {task.studentInitials}
      </span>
      <span className="min-w-0 truncate text-xs font-semibold">
        {task.studentName}
      </span>
    </Link>
  );
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

function TaskStatusSelect({
  task,
  onUpdateTask,
}: Pick<TaskManagementKanbanCardProps, "task" | "onUpdateTask">) {
  return (
    <Select
      value={task.status}
      onChange={(value) =>
        onUpdateTask(task.id, {
          status: String(value) as StudentTaskItem["status"],
        })
      }
      aria-label={`Cập nhật trạng thái task ${task.title}`}
    >
      <SelectTrigger
        size="sm"
        className="w-fit max-w-full border-0 bg-transparent p-0 shadow-none hover:bg-transparent focus:ring-0"
      >
        <StudentTaskStatusBadge status={task.status} size="sm" />
        <SelectValue className="sr-only" />
        <SelectIndicator className="ml-1 shrink-0 text-text-primary" />
      </SelectTrigger>
      <SelectContent className="min-w-40">
        {statusOptions.map((option) => (
          <SelectItem
            key={option}
            id={option}
            textValue={taskStatusLabel[option]}
          >
            <StudentTaskStatusBadge status={option} size="sm" />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function TaskManagementKanbanCard({
  task,
  onUpdateTask,
  onDeleteTask,
}: TaskManagementKanbanCardProps) {
  const completed = task.status === "done" || task.status === "canceled";
  const { isDragging, handleRef, ref } = useDraggable({
    id: `task-${task.id}`,
    data: { taskId: task.id },
  });

  return (
    <article
      ref={ref}
      role="listitem"
      className={`group rounded-lg border border-card-border bg-card-background p-2.5 transition-colors hover:border-primary-300 ${
        isDragging ? "opacity-60 ring-2 ring-primary-500" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex min-w-0 items-center gap-1.5">
          <button
            ref={handleRef}
            type="button"
            aria-label={`Kéo task ${task.title} để chuyển trạng thái`}
            title="Kéo để chuyển trạng thái"
            className="flex size-6 shrink-0 cursor-grab items-center justify-center rounded-md text-base leading-none text-text-tertiary outline-none transition hover:bg-background-soft-50 hover:text-text-primary active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <span aria-hidden="true">⠿</span>
          </button>
          <TaskStatusSelect task={task} onUpdateTask={onUpdateTask} />
        </div>
        {onDeleteTask && (
          <Button
            iconOnly
            size="sm"
            variant="ghost"
            appearance="ghost"
            aria-label={`Xóa task ${task.title}`}
            className="size-6 text-text-tertiary opacity-70 hover:text-error-500 focus-visible:opacity-100 group-hover:opacity-100"
            onPress={() => onDeleteTask(task.id)}
          >
            <Trash1 size={15} aria-hidden="true" />
          </Button>
        )}
      </div>

      <Link
        href={taskHref(task)}
        className="mt-2 block rounded-md outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        <h3
          className={cn(
            "line-clamp-2 text-sm leading-5 font-semibold text-text-primary hover:text-primary-500",
            completed && "text-text-tertiary line-through",
          )}
        >
          {task.title}
        </h3>
      </Link>

      <div className="mt-2.5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 border-t border-card-border pt-2.5 text-xs">
        <TaskStudentSummary task={task} />
        <span
          className="max-w-28 truncate text-right text-text-tertiary"
          title={task.assignee || "Chưa phân công"}
        >
          {task.assignee || "Chưa phân công"}
        </span>
        <TaskDeadline task={task} />
        <StudentTaskPriority priority={task.priority} size="sm" />
        <span className="col-span-2 truncate font-medium text-text-secondary">
          {taskTypeLabel[task.taskType ?? "todo"]}
        </span>
      </div>

      {task.notes && (
        <p className="mt-2.5 line-clamp-2 border-t border-card-border pt-2.5 text-xs leading-5 text-text-secondary">
          {task.notes}
        </p>
      )}
    </article>
  );
}
