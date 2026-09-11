"use client";

import {
  DragDropProvider,
  type DragEndEvent,
  useDroppable,
} from "@dnd-kit/react";
import { defaultCollisionDetection } from "@dnd-kit/collision";
import { Plus } from "@tailgrids/icons";
import type { StudentTaskItem } from "@/services/api/students/types";
import type { TaskManagementItem } from "@/services/api/tasks/types";
import { Button } from "@/components/tailgrids/core/button";
import {
  ScrollArea,
  ScrollAreaViewport,
  ScrollBar,
} from "@/components/tailgrids/core/scroll-area";

import TaskManagementKanbanCard from "./task-management-kanban-card";
import TaskManagementKanbanSkeleton from "./task-management-kanban-skeleton";
import { taskStatusLabel } from "../../students/_components/student-task-badges";
import type { TaskLanePagination } from "./types";

type TaskStatus = TaskManagementItem["status"];

interface TaskManagementKanbanProps {
  tasks: TaskManagementItem[];
  onOpenTask: (task: TaskManagementItem) => void;
  onUpdateTask: (
    id: string,
    updates: Partial<StudentTaskItem>,
  ) => void | Promise<void>;
  onDeleteTask?: (id: string) => void;
  lanePagination?: Partial<Record<TaskStatus, TaskLanePagination>>;
  onCreateTask?: () => void;
  isLoading?: boolean;
}

const columns: Array<{
  status: TaskManagementItem["status"];
  label: string;
  dotClassName: string;
  countClassName: string;
}> = [
  {
    status: "todo",
    label: taskStatusLabel.todo,
    dotClassName: "bg-badge-neutral-icon-color",
    countClassName: "bg-badge-neutral-background text-badge-neutral-text",
  },
  {
    status: "in-progress",
    label: taskStatusLabel["in-progress"],
    dotClassName: "bg-badge-warning-icon-color",
    countClassName: "bg-badge-warning-background text-badge-warning-text",
  },
  {
    status: "done",
    label: taskStatusLabel.done,
    dotClassName: "bg-badge-success-icon-color",
    countClassName: "bg-badge-success-background text-badge-success-text",
  },
  {
    status: "canceled",
    label: taskStatusLabel.canceled,
    dotClassName: "bg-badge-error-icon-color",
    countClassName: "bg-badge-error-background text-badge-error-text",
  },
];

function isTaskStatus(value: unknown): value is TaskStatus {
  return columns.some((column) => column.status === value);
}

interface TaskManagementKanbanColumnProps {
  status: TaskStatus;
  label: string;
  dotClassName: string;
  countClassName: string;
  tasks: TaskManagementItem[];
  onOpenTask: TaskManagementKanbanProps["onOpenTask"];
  onUpdateTask: TaskManagementKanbanProps["onUpdateTask"];
  onDeleteTask?: TaskManagementKanbanProps["onDeleteTask"];
  onCreateTask?: TaskManagementKanbanProps["onCreateTask"];
  pagination?: TaskLanePagination;
  isLoading: boolean;
}

function TaskManagementKanbanColumn({
  status,
  label,
  dotClassName,
  countClassName,
  tasks,
  onOpenTask,
  onUpdateTask,
  onDeleteTask,
  onCreateTask,
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
      className={`flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-card-border bg-background-soft-50 transition-colors ${
        isDropTarget ? "bg-primary-50/50" : ""
      }`}
    >
      <header className="flex shrink-0 items-center justify-between gap-3 px-3.5 py-3.5">
        <h2
          id={`task-column-${status}`}
          className="flex min-w-0 items-center gap-2 text-sm font-semibold text-text-primary"
        >
          <span
            className={`size-2 shrink-0 rounded-full ${dotClassName}`}
            aria-hidden="true"
          />
          <span className="truncate">{label}</span>
          <span
            className={`flex min-w-7 shrink-0 items-center justify-center rounded-full px-2 py-1 text-sm font-bold leading-none ${countClassName}`}
            aria-label={`${taskCountLabel} task`}
          >
            {isLoading ? "—" : taskCountLabel}
          </span>
        </h2>
        <div className="flex items-center gap-1">
          {onCreateTask && (
            <Button
              iconOnly
              size="xs"
              variant="ghost"
              appearance="ghost"
              aria-label={`Tạo task trong nhóm ${label}`}
              onPress={onCreateTask}
              className="size-7 text-text-tertiary hover:bg-card-background hover:text-text-primary"
            >
              <Plus size={15} aria-hidden="true" />
            </Button>
          )}
        </div>
      </header>

      <ScrollArea className="min-h-0 min-w-0 flex-1 overflow-hidden">
        <ScrollAreaViewport className="overscroll-y-contain p-3">
          <div
            className="flex flex-col gap-2.5"
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
                  onOpenTask={onOpenTask}
                  onUpdateTask={onUpdateTask}
                  onDeleteTask={onDeleteTask}
                />
              ))
            ) : (
              <p className="rounded-lg border border-dashed border-card-border bg-card-background/60 px-3 py-10 text-center text-xs text-text-tertiary">
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
  onOpenTask,
  onUpdateTask,
  onDeleteTask,
  lanePagination,
  onCreateTask,
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
    <div
      className="min-h-0 min-w-0 flex-1 overflow-x-auto overflow-y-hidden bg-transparent px-0 pb-3 pt-1"
      aria-busy={isLoading}
    >
      <DragDropProvider onDragEnd={handleDragEnd}>
        <div
          className="grid h-full min-h-0 min-w-[960px] grid-cols-4 gap-3 lg:min-w-0 xl:gap-4"
          aria-label="Bảng kanban quản lý task"
        >
          {columns.map((column) => (
            <TaskManagementKanbanColumn
              key={column.status}
              status={column.status}
              label={column.label}
              dotClassName={column.dotClassName}
              countClassName={column.countClassName}
              tasks={tasks.filter((task) => task.status === column.status)}
              onOpenTask={onOpenTask}
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
              onCreateTask={onCreateTask}
              pagination={lanePagination?.[column.status]}
              isLoading={isLoading}
            />
          ))}
        </div>
      </DragDropProvider>
    </div>
  );
}
