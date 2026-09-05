"use client";

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
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import type { StudentTaskItem } from "@/services/api/students/types";
import type { TaskManagementItem } from "@/services/api/tasks/types";
import { formatDate } from "@/utils/format-date";

import {
  StudentTaskPriority,
  StudentTaskStatusBadge,
  taskStatusLabel,
  taskTypeLabel,
} from "../../students/_components/student-task-badges";

interface TaskManagementTableProps {
  tasks: TaskManagementItem[];
  onUpdateTask: (
    id: string,
    updates: Partial<StudentTaskItem>,
  ) => void | Promise<void>;
  onDeleteTask: (id: string) => void;
}

function isOverdue(task: TaskManagementItem): boolean {
  if (task.status === "done" || task.status === "canceled") return false;
  const dueDate = task.dueDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  const date = dueDate
    ? `${dueDate[3]}-${dueDate[2]}-${dueDate[1]}`
    : task.dueDate;

  return new Date(`${date}T${task.dueTime || "23:59"}`).getTime() < Date.now();
}

function taskHref(task: TaskManagementItem): string {
  return `/director/students/${task.studentId}?tab=activities&taskId=${task.id}`;
}

function TaskStudentSummary({
  task,
  className = "",
}: {
  task: TaskManagementItem;
  className?: string;
}) {
  return (
    <Link
      href={taskHref(task)}
      className={`flex min-w-0 items-center gap-2 text-text-primary hover:text-primary-500 ${className}`}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-badge-primary-background text-xs font-semibold text-badge-primary-text">
        {task.studentInitials}
      </span>
      <span className="min-w-0 truncate text-[13px] font-semibold">
        {task.studentName}
      </span>
    </Link>
  );
}

function TaskDeadline({ task }: { task: TaskManagementItem }) {
  const overdue = isOverdue(task);

  return (
    <div className="min-w-0">
      <span
        className={
          overdue
            ? "inline-flex max-w-full items-center gap-1.5 truncate text-[13px] font-semibold text-error-500"
            : "inline-flex max-w-full items-center gap-1.5 truncate text-[13px] text-text-secondary"
        }
      >
        <CalendarTime size={14} aria-hidden="true" />
        <span className="truncate">
          {formatDate(task.dueDate)}
          {task.dueTime && (
            <span className="text-[11px]"> · {task.dueTime}</span>
          )}
        </span>
      </span>
      {overdue && (
        <span className="mt-0.5 block text-[11px] font-medium text-error-500">
          Quá hạn
        </span>
      )}
    </div>
  );
}

function DeleteTaskButton({
  task,
  onDeleteTask,
}: {
  task: TaskManagementItem;
  onDeleteTask: (id: string) => void;
}) {
  return (
    <Button
      iconOnly
      size="sm"
      variant="ghost"
      appearance="ghost"
      aria-label={`Xóa task ${task.title}`}
      className="shrink-0 text-text-tertiary hover:text-error-500"
      onPress={() => onDeleteTask(task.id)}
    >
      <Trash1 size={16} aria-hidden="true" />
    </Button>
  );
}

export default function TaskManagementTable({
  tasks,
  onUpdateTask,
  onDeleteTask,
}: TaskManagementTableProps) {
  if (tasks.length === 0) {
    return (
      <div className="px-5 py-16 text-center">
        <p className="font-medium text-text-primary">
          Không tìm thấy task phù hợp
        </p>
        <p className="mt-1 text-sm text-text-tertiary">
          Thử thay đổi từ khóa hoặc bộ lọc để xem thêm task.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden w-full lg:block">
        <TableRoot className="w-full table-fixed rounded-none border-none">
          <colgroup>
            <col className="w-[26%]" />
            <col className="w-[18%]" />
            <col className="w-[15%]" />
            <col className="w-[19%]" />
            <col className="w-[8%]" />
            <col className="w-[11%]" />
            <col className="w-[3%]" />
          </colgroup>
          <TableHeader className="bg-background-gray-secondary/50 [&_th]:border-t">
            <TableRow>
              <TableHead className="px-3 py-2.5 text-[11px] leading-4 font-semibold text-text-secondary lg:px-4">
                Tên task
              </TableHead>
              <TableHead className="px-3 py-2.5 text-[11px] leading-4 font-semibold text-text-secondary lg:px-4">
                Học sinh
              </TableHead>
              <TableHead className="px-3 py-2.5 text-[11px] leading-4 font-semibold text-text-secondary lg:px-4">
                Trạng thái
              </TableHead>
              <TableHead className="px-3 py-2.5 text-[11px] leading-4 font-semibold text-text-secondary lg:px-4">
                Hạn xử lý
              </TableHead>
              <TableHead className="px-3 py-2.5 text-[11px] leading-4 font-semibold text-text-secondary lg:px-4">
                Loại
              </TableHead>
              <TableHead className="px-3 py-2.5 text-[11px] leading-4 font-semibold text-text-secondary lg:px-4">
                Ưu tiên
              </TableHead>
              <TableHead className="px-1 py-2.5" aria-label="Thao tác" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow
                key={task.id}
                className="transition hover:bg-background-soft-50"
              >
                <TableCell className="max-w-0 px-3 py-2.5 lg:px-4">
                  <Link
                    href={taskHref(task)}
                    className="group block min-w-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    <p className="truncate text-[13px] leading-5 font-semibold text-text-primary group-hover:text-primary-500 group-hover:underline">
                      {task.title}
                    </p>
                  </Link>
                </TableCell>
                <TableCell className="max-w-0 px-3 py-2.5 lg:px-4">
                  <TaskStudentSummary task={task} />
                </TableCell>
                <TableCell className="max-w-0 px-3 py-2.5 lg:px-4">
                  <SelectStatus
                    task={task}
                    onUpdateTask={onUpdateTask}
                    compact
                  />
                </TableCell>
                <TableCell className="max-w-0 px-3 py-2.5 lg:px-4">
                  <TaskDeadline task={task} />
                </TableCell>
                <TableCell className="max-w-0 px-3 py-2.5 lg:px-4">
                  <span className="block truncate text-[13px] font-medium text-text-primary">
                    {taskTypeLabel[task.taskType ?? "todo"]}
                  </span>
                </TableCell>
                <TableCell className="px-3 py-2.5 lg:px-4">
                  <StudentTaskPriority priority={task.priority} size="sm" />
                </TableCell>
                <TableCell className="px-1 py-2.5">
                  <DeleteTaskButton task={task} onDeleteTask={onDeleteTask} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableRoot>
      </div>

      <div className="divide-y divide-card-border lg:hidden">
        {tasks.map((task) => (
          <article key={task.id} className="p-4">
            <div className="flex items-start gap-3">
              <Link
                href={taskHref(task)}
                className="min-w-0 flex-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <p className="truncate font-semibold text-text-primary">
                  {task.title}
                </p>
              </Link>
              <DeleteTaskButton task={task} onDeleteTask={onDeleteTask} />
            </div>
            <div className="mt-3 flex min-w-0 items-center justify-between gap-3">
              <TaskStudentSummary task={task} className="flex-1" />
              <SelectStatus task={task} onUpdateTask={onUpdateTask} compact />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <TaskDeadline task={task} />
              <span className="font-medium text-text-primary">
                {taskTypeLabel[task.taskType ?? "todo"]}
              </span>
              <StudentTaskPriority priority={task.priority} size="sm" />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function SelectStatus({
  task,
  onUpdateTask,
  compact = false,
}: {
  task: TaskManagementItem;
  onUpdateTask: TaskManagementTableProps["onUpdateTask"];
  compact?: boolean;
}) {
  const options: StudentTaskItem["status"][] = [
    "todo",
    "in-progress",
    "done",
    "canceled",
  ];

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
        className="max-w-full border-0 bg-transparent p-0 shadow-none hover:bg-transparent focus:ring-0"
      >
        <StudentTaskStatusBadge
          status={task.status}
          size={compact ? "sm" : "md"}
        />
        <SelectValue className="sr-only" />
        <SelectIndicator className="ml-1 shrink-0 text-text-primary" />
      </SelectTrigger>
      <SelectContent className="min-w-40">
        {options.map((option) => (
          <SelectItem
            key={option}
            id={option}
            textValue={taskStatusLabel[option]}
          >
            <StudentTaskStatusBadge
              status={option}
              size={compact ? "sm" : "md"}
            />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
