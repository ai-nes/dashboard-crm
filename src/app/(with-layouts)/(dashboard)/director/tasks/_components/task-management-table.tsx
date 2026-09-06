"use client";

import { useMemo, useState, type KeyboardEvent, type MouseEvent } from "react";
import { ArrowLeft, ArrowRight, CalendarTime } from "@tailgrids/icons";

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
import type { TaskLanePagination } from "./types";

interface TaskManagementTableProps {
  tasks: TaskManagementItem[];
  onOpenTask: (task: TaskManagementItem) => void;
  onUpdateTask: (
    id: string,
    updates: Partial<StudentTaskItem>,
  ) => void | Promise<void>;
  onDeleteTask?: (id: string) => void;
  lanePagination?: Partial<
    Record<TaskManagementItem["status"], TaskLanePagination>
  >;
  isLoading?: boolean;
}

const statuses: TaskManagementItem["status"][] = [
  "todo",
  "in-progress",
  "done",
  "canceled",
];
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

function TaskPerson({
  name,
  fallback,
}: {
  name?: string;
  fallback?: string;
}) {
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
  lanePagination,
  isLoading = false,
}: TaskManagementTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const paginatedLanes = statuses
    .map((status) => lanePagination?.[status])
    .filter((pagination): pagination is TaskLanePagination => Boolean(pagination));
  const hasMoreTasks = paginatedLanes.some((pagination) => pagination.hasMore);
  const isLoadingMore = paginatedLanes.some((pagination) => pagination.isLoading);
  const pageCount = Math.max(1, Math.ceil(tasks.length / TABLE_PAGE_SIZE));
  const activePage = Math.min(currentPage, pageCount);
  const visibleTasks = useMemo(() => {
    const start = (activePage - 1) * TABLE_PAGE_SIZE;
    return tasks.slice(start, start + TABLE_PAGE_SIZE);
  }, [activePage, tasks]);
  const firstVisibleIndex =
    tasks.length === 0 ? 0 : (activePage - 1) * TABLE_PAGE_SIZE + 1;
  const lastVisibleIndex = Math.min(activePage * TABLE_PAGE_SIZE, tasks.length);
  const pageNumbers = Array.from({ length: pageCount }, (_, index) => index + 1);

  const loadMoreTasks = () => {
    paginatedLanes.forEach((pagination) => {
      if (pagination.hasMore && !pagination.isLoading) {
        pagination.onLoadMore();
      }
    });
  };

  return (
    <div className="bg-background-50 px-4 pb-5 pt-1 lg:px-5">
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
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-card-border px-5 py-3">
          <span className="text-xs text-text-tertiary">
            {tasks.length > 0
              ? `Hiển thị ${firstVisibleIndex}–${lastVisibleIndex} / ${tasks.length} task`
              : "0 task"}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Trang trước"
              disabled={activePage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              className="inline-flex size-8 items-center justify-center rounded-md text-text-secondary transition hover:bg-background-gray-secondary_alt disabled:cursor-not-allowed disabled:text-text-tertiary"
            >
              <ArrowLeft size={14} aria-hidden="true" />
            </button>
            {pageNumbers.map((page) => (
              <button
                key={page}
                type="button"
                aria-label={`Trang ${page}`}
                aria-current={activePage === page ? "page" : undefined}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  "inline-flex size-8 items-center justify-center rounded-md text-xs font-semibold transition",
                  activePage === page
                    ? "bg-primary-500 text-white"
                    : "text-text-secondary hover:bg-background-gray-secondary_alt",
                )}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              aria-label="Trang sau"
              disabled={activePage === pageCount}
              onClick={() =>
                setCurrentPage((page) => Math.min(pageCount, Math.max(activePage, page) + 1))
              }
              className="inline-flex size-8 items-center justify-center rounded-md text-text-secondary transition hover:bg-background-gray-secondary_alt disabled:cursor-not-allowed disabled:text-text-tertiary"
            >
              <ArrowRight size={14} aria-hidden="true" />
            </button>
          </div>
          {hasMoreTasks && (
            <button
              type="button"
              disabled={isLoadingMore}
              onClick={loadMoreTasks}
              className="text-xs font-semibold text-primary-500 hover:text-primary-600 disabled:cursor-not-allowed disabled:text-text-tertiary"
            >
              {isLoadingMore ? "Đang tải..." : "Xem thêm task"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
