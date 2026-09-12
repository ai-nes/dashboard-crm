"use client";

import { useMemo, useState, type KeyboardEvent, type MouseEvent } from "react";
import { CalendarTime } from "@tailgrids/icons";

import { Pagination } from "@/components/tailgrids/core/pagination";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import type { TaskManagementItem } from "@/services/api/tasks/types";
import type { StudentTaskItem } from "@/services/api/students/types";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/format-date";

import {
  StudentTaskPriority,
  StudentTaskStatusBadge,
  StudentTaskTypeBadge,
} from "../../students/_components/student-task-badges";
import TaskManagementTaskActions from "./task-management-task-actions";

interface TaskManagementTableProps {
  tasks: TaskManagementItem[];
  onOpenTask: (task: TaskManagementItem) => void;
  onUpdateTask: (
    id: string,
    updates: Partial<StudentTaskItem>,
  ) => void | Promise<void>;
  onDeleteTask?: (id: string) => void;
  isLoading?: boolean;
}

const TABLE_PAGE_SIZE = 10;

function getInitials(name?: string, fallback = "--"): string {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length === 0) return fallback;
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts.at(-1)?.[0] ?? ""}`.toUpperCase();
}

function isOverdue(task: TaskManagementItem): boolean {
  if (task.status === "done" || task.status === "canceled") return false;

  const ddmmyyyy = task.dueDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  const date = ddmmyyyy
    ? `${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`
    : task.dueDate;

  return new Date(`${date}T${task.dueTime || "23:59"}`).getTime() < Date.now();
}

function handleRowKeyDown(
  event: KeyboardEvent<HTMLTableRowElement>,
  task: TaskManagementItem,
  onOpenTask: (task: TaskManagementItem) => void,
) {
  if (event.target !== event.currentTarget) return;
  if (event.key !== "Enter" && event.key !== " ") return;

  event.preventDefault();
  onOpenTask(task);
}

function handleRowClick(
  event: MouseEvent<HTMLTableRowElement>,
  task: TaskManagementItem,
  onOpenTask: (task: TaskManagementItem) => void,
) {
  if ((event.target as HTMLElement).closest("button, a")) return;
  onOpenTask(task);
}

function TaskPerson({ name, fallback }: { name?: string; fallback?: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-background-gray-secondary text-[10px] font-semibold text-text-secondary">
        {getInitials(name, fallback)}
      </span>
      <span className="block whitespace-nowrap text-xs font-semibold text-text-primary">
        {name || "Chưa phân công"}
      </span>
    </div>
  );
}

function TaskDeadline({ task }: { task: TaskManagementItem }) {
  const overdue = isOverdue(task);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap text-xs",
        overdue ? "font-semibold text-error-500" : "text-text-secondary",
      )}
      aria-label={`${overdue ? "Quá hạn" : "Hạn xử lý"}: ${formatDate(task.dueDate)}${task.dueTime ? `, ${task.dueTime}` : ""}`}
    >
      <CalendarTime size={14} aria-hidden="true" />
      <span>
        {formatDate(task.dueDate)}
        {task.dueTime && ` · ${task.dueTime}`}
      </span>
    </span>
  );
}

function TaskTableRow({
  task,
  onOpenTask,
  onUpdateTask,
  onDeleteTask,
}: {
  task: TaskManagementItem;
  onOpenTask: (task: TaskManagementItem) => void;
  onUpdateTask: TaskManagementTableProps["onUpdateTask"];
  onDeleteTask?: TaskManagementTableProps["onDeleteTask"];
}) {
  return (
    <TableRow
      tabIndex={0}
      onClick={(event) => handleRowClick(event, task, onOpenTask)}
      onKeyDown={(event) => handleRowKeyDown(event, task, onOpenTask)}
      className="cursor-pointer transition-colors hover:bg-background-gray-secondary_alt/55 focus-visible:bg-background-gray-secondary_alt/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500"
    >
      <TableCell className="w-44 align-middle">
        <StudentTaskTypeBadge
          actionCode={task.actionCode}
          taskType={task.taskType}
          size="sm"
          compact
          className="max-w-[9rem] truncate whitespace-nowrap"
        />
      </TableCell>
      <TableCell className="w-[40%] max-w-0 align-middle">
        <button
          type="button"
          onClick={() => onOpenTask(task)}
          title={task.title}
          className="block max-w-full truncate text-left text-sm font-semibold text-text-primary outline-none hover:text-primary-500 focus-visible:underline"
        >
          {task.title}
        </button>
      </TableCell>
      <TableCell className="align-middle">
        <TaskPerson name={task.assignee} />
      </TableCell>
      <TableCell className="whitespace-nowrap align-middle">
        <TaskDeadline task={task} />
      </TableCell>
      <TableCell className="align-middle">
        <StudentTaskPriority priority={task.priority} size="sm" />
      </TableCell>
      <TableCell className="align-middle">
        <StudentTaskStatusBadge status={task.status} size="sm" />
      </TableCell>
      <TableCell className="w-12 whitespace-nowrap text-right align-middle">
        <TaskManagementTaskActions
          task={task}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
        />
      </TableCell>
    </TableRow>
  );
}

export default function TaskManagementTable({
  tasks,
  onOpenTask,
  onUpdateTask,
  onDeleteTask,
  isLoading = false,
}: TaskManagementTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(tasks.length / TABLE_PAGE_SIZE));
  const activePage = Math.min(currentPage, pageCount);
  const visibleTasks = useMemo(() => {
    const start = (activePage - 1) * TABLE_PAGE_SIZE;
    return tasks.slice(start, start + TABLE_PAGE_SIZE);
  }, [activePage, tasks]);
  const firstVisibleIndex =
    tasks.length === 0 ? 0 : (activePage - 1) * TABLE_PAGE_SIZE + 1;
  const lastVisibleIndex = Math.min(activePage * TABLE_PAGE_SIZE, tasks.length);

  return (
    <div className="bg-transparent px-0 pb-0 pt-1">
      <div className="overflow-hidden rounded-xl border border-card-border bg-card-background">
        <div>
          <TableRoot fullBleed className="w-full min-w-0 table-fixed border-0">
            <TableHeader>
              <TableRow className="[&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:bg-card-background">
                <TableHead className="w-44">Loại task</TableHead>
                <TableHead className="w-[40%]">Tên task</TableHead>
                <TableHead className="w-48">Phụ trách</TableHead>
                <TableHead className="w-44">Hạn xử lý</TableHead>
                <TableHead className="w-28">Ưu tiên</TableHead>
                <TableHead className="w-32">Trạng thái</TableHead>
                <TableHead
                  aria-label="Thao tác"
                  className="w-12 whitespace-nowrap text-right"
                />
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleTasks.length > 0 ? (
                visibleTasks.map((task) => (
                  <TaskTableRow
                    key={task.id}
                    task={task}
                    onOpenTask={onOpenTask}
                    onUpdateTask={onUpdateTask}
                    onDeleteTask={onDeleteTask}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center text-xs text-text-tertiary"
                  >
                    {isLoading ? "Đang tải task..." : "Chưa có task"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </TableRoot>
        </div>
        <footer className="flex flex-col gap-3 border-t border-card-border px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p
            aria-live="polite"
            className="shrink-0 whitespace-nowrap text-xs text-text-secondary"
          >
            {tasks.length > 0
              ? `Hiển thị ${firstVisibleIndex.toLocaleString("vi-VN")}–${lastVisibleIndex.toLocaleString("vi-VN")} trong tổng số ${tasks.length.toLocaleString("vi-VN")} task`
              : "0 task"}
          </p>
          <div className="flex flex-wrap items-center justify-end gap-3 max-sm:w-full">
            {pageCount > 1 && (
              <div className="shrink-0 max-sm:w-full">
                <Pagination
                  currentPage={activePage}
                  totalPages={pageCount}
                  onPageChange={setCurrentPage}
                  variant="compact"
                  isDisabled={isLoading}
                />
              </div>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
