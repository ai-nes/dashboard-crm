"use client";

import {
  DragDropProvider,
  type DragEndEvent,
  useDroppable,
} from "@dnd-kit/react";
import { defaultCollisionDetection } from "@dnd-kit/collision";
import type { StudentTaskItem } from "@/services/api/students/types";
import type { TaskManagementItem } from "@/services/api/tasks/types";
import { Button } from "@/components/tailgrids/core/button";
import {
  ScrollArea,
  ScrollAreaViewport,
  ScrollBar,
} from "@/components/tailgrids/core/scroll-area";
import { Skeleton } from "@/components/tailgrids/core/skeleton";

import TaskManagementKanbanCard from "./task-management-kanban-card";
import TaskManagementKanbanSkeleton from "./task-management-kanban-skeleton";
import { taskStatusLabel } from "../../students/_components/student-task-badges";

type TaskStatus = TaskManagementItem["status"];

interface TaskLanePagination {
  total: number;
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

interface TaskManagementKanbanProps {
  tasks: TaskManagementItem[];
  onUpdateTask: (
    id: string,
    updates: Partial<StudentTaskItem>,
  ) => void | Promise<void>;
  onDeleteTask?: (id: string) => void;
  lanePagination?: Partial<Record<TaskStatus, TaskLanePagination>>;
  isLoading?: boolean;
}

const columns: Array<{
  status: TaskManagementItem["status"];
  label: string;
  dotClassName: string;
}> = [
  {
    status: "todo",
    label: taskStatusLabel.todo,
    dotClassName: "bg-badge-neutral-icon-color",
  },
  {
    status: "in-progress",
    label: taskStatusLabel["in-progress"],
    dotClassName: "bg-badge-warning-icon-color",
  },
  {
    status: "done",
    label: taskStatusLabel.done,
    dotClassName: "bg-badge-success-icon-color",
  },
  {
    status: "canceled",
    label: taskStatusLabel.canceled,
    dotClassName: "bg-badge-error-icon-color",
  },
];

function isTaskStatus(value: unknown): value is TaskStatus {
  return columns.some((column) => column.status === value);
}

interface TaskManagementKanbanColumnProps {
  status: TaskStatus;
  label: string;
  dotClassName: string;
  tasks: TaskManagementItem[];
  onUpdateTask: TaskManagementKanbanProps["onUpdateTask"];
  onDeleteTask?: TaskManagementKanbanProps["onDeleteTask"];
  pagination?: TaskLanePagination;
  isLoading: boolean;
}

function TaskManagementKanbanColumn({
  status,
  label,
  dotClassName,
  tasks,
  onUpdateTask,
  onDeleteTask,
  pagination,
  isLoading,
}: TaskManagementKanbanColumnProps) {
  const { isDropTarget, ref } = useDroppable({
    id: `task-column-${status}`,
    data: { status },
    collisionDetector: defaultCollisionDetection,
  });
  const taskCountLabel =
    pagination && pagination.total > tasks.length
      ? `${tasks.length}/${pagination.total}`
      : String(tasks.length);

  return (
    <section
      ref={ref}
      aria-labelledby={`task-column-${status}`}
      aria-busy={isLoading}
      className={`flex h-[calc(100vh-20rem)] min-h-[420px] max-h-[720px] flex-col overflow-hidden rounded-lg border bg-background-soft-50/70 transition-colors ${
        isDropTarget
          ? "border-primary-500 bg-primary-50/50"
          : "border-card-border"
      }`}
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-card-border px-3.5 py-3">
        <h2
          id={`task-column-${status}`}
          className="flex min-w-0 items-center gap-2 text-sm font-semibold text-text-primary"
        >
          <span
            className={`size-2 shrink-0 rounded-full ${dotClassName}`}
            aria-hidden="true"
          />
          <span className="truncate">{label}</span>
        </h2>
        {isLoading ? (
          <Skeleton aria-hidden="true" className="h-5 w-8 rounded-full" />
        ) : (
          <span className="shrink-0 rounded-full bg-card-background px-2 py-0.5 text-xs font-semibold text-text-secondary">
            {taskCountLabel}
          </span>
        )}
      </header>

      <ScrollArea className="min-h-0 flex-1">
        <ScrollAreaViewport className="p-3">
          <div
            className="flex flex-col gap-3"
            role="list"
            aria-label={`${label}: ${tasks.length}${pagination && pagination.total > tasks.length ? ` trong tổng số ${pagination.total}` : ""} task`}
          >
            {isLoading ? (
              <TaskManagementKanbanSkeleton />
            ) : tasks.length > 0 ? (
              tasks.map((task) => (
                <TaskManagementKanbanCard
                  key={task.id}
                  task={task}
                  onUpdateTask={onUpdateTask}
                  onDeleteTask={onDeleteTask}
                />
              ))
            ) : (
              <p className="rounded-md border border-dashed border-card-border px-3 py-8 text-center text-xs text-text-tertiary">
                {isDropTarget ? "Thả task vào đây" : "Chưa có task"}
              </p>
            )}

            {pagination?.hasMore && (
              <Button
                size="sm"
                variant="ghost"
                appearance="ghost"
                isDisabled={pagination.isLoading}
                onPress={pagination.onLoadMore}
                className="w-full justify-center border border-dashed border-card-border text-text-secondary hover:bg-card-background hover:text-text-primary"
              >
                {pagination.isLoading ? "Đang tải..." : "Xem thêm"}
              </Button>
            )}
          </div>
        </ScrollAreaViewport>
        <ScrollBar />
      </ScrollArea>
    </section>
  );
}

export default function TaskManagementKanban({
  tasks,
  onUpdateTask,
  onDeleteTask,
  lanePagination,
  isLoading = false,
}: TaskManagementKanbanProps) {
  const handleDragEnd = (event: DragEndEvent) => {
    if (event.canceled) return;

    const taskId = event.operation.source?.data.taskId;
    const nextStatus = event.operation.target?.data.status;

    if (typeof taskId !== "string" || !isTaskStatus(nextStatus)) return;

    const task = tasks.find((item) => item.id === taskId);
    if (!task || task.status === nextStatus) return;

    onUpdateTask(task.id, { status: nextStatus });
  };

  return (
    <div className="overflow-x-auto px-4 pb-5 lg:px-5" aria-busy={isLoading}>
      <DragDropProvider onDragEnd={handleDragEnd}>
        <div
          className="grid min-w-[1080px] grid-cols-4 gap-3 xl:gap-4"
          aria-label="Bảng kanban quản lý task"
        >
          {columns.map((column) => (
            <TaskManagementKanbanColumn
              key={column.status}
              status={column.status}
              label={column.label}
              dotClassName={column.dotClassName}
              tasks={tasks.filter((task) => task.status === column.status)}
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
              pagination={lanePagination?.[column.status]}
              isLoading={isLoading}
            />
          ))}
        </div>
      </DragDropProvider>
    </div>
  );
}
