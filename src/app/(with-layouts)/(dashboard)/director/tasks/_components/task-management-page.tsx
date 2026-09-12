"use client";

import { useMemo, useRef, useState } from "react";
import { keepPreviousData } from "@tanstack/react-query";
import { Plus } from "@tailgrids/icons";
import { toast } from "sonner";

import { Button } from "@/components/tailgrids/core/button";
import { useAuth } from "@/components/common/auth/auth-provider";
import { getCrmPermissions } from "@/components/common/auth/permissions";
import {
  useCreateCrmTaskMutation,
  useCrmTasksQuery,
  useDeleteCrmTaskMutation,
  useUpdateCrmTaskMutation,
} from "@/hooks/use-crm-tasks-queries";
import { useTaskAssigneesQuery } from "@/hooks/use-task-assignees-query";
import { useAssignedStudentsQuery } from "@/hooks/use-students-queries";
import type { CRMTaskStatus } from "@/services/api/crm-tasks";
import type { TaskManagementItem } from "@/services/api/tasks/types";

import TaskCreateDialog from "./task-create-dialog";
import TaskDetailSheet from "./task-detail-sheet";
import TaskManagementKanban from "./task-management-kanban";
import TaskManagementTable from "./task-management-table";
import TaskManagementToolbar from "./task-management-toolbar";
import StudentDeleteTaskDialog from "../../students/_components/student-delete-task-dialog";
import { mergeTaskLists } from "./merge-task-lists";
import { crmTaskToManagementItem } from "./task-management-mappers";
import type { TaskLayout, TaskStatusFilter, TaskView } from "./types";
import {
  studentTaskToCreatePayload,
  studentTaskToUpdatePayload,
} from "../../students/_components/student-task-mappers";

interface TaskManagementPageProps {
  useCrmApi?: boolean;
}

function startOfDay(date: Date): number {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

function toDateInputValue(value: string): string {
  const ddmmyyyy = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    return `${year}-${month}-${day}`;
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

function dueTimestamp(task: TaskManagementItem): number {
  const date = toDateInputValue(task.dueDate);
  return date
    ? new Date(`${date}T${task.dueTime || "23:59"}`).getTime()
    : Number.POSITIVE_INFINITY;
}

function isOverdue(task: TaskManagementItem, now = Date.now()): boolean {
  return (
    task.status !== "done" &&
    task.status !== "canceled" &&
    dueTimestamp(task) < now
  );
}

function isDueToday(task: TaskManagementItem, now = new Date()): boolean {
  const date = toDateInputValue(task.dueDate);
  if (!date) return false;
  const due = new Date(`${date}T00:00:00`);
  return startOfDay(due) === startOfDay(now);
}

function isUpcoming(task: TaskManagementItem, now = new Date()): boolean {
  const date = toDateInputValue(task.dueDate);
  if (!date) return false;
  const due = new Date(`${date}T00:00:00`);
  return !isOverdue(task, now.getTime()) && startOfDay(due) > startOfDay(now);
}

type ManagedTaskStatus = TaskManagementItem["status"];

const TASK_LANE_PAGE_SIZE = 20;

const INITIAL_LANE_PAGES: Record<ManagedTaskStatus, number> = {
  todo: 1,
  "in-progress": 1,
  done: 1,
  canceled: 1,
};

const CRM_STATUS_BY_LANE: Record<ManagedTaskStatus, CRMTaskStatus[]> = {
  todo: ["Backlog", "Todo"],
  "in-progress": ["In Progress"],
  done: ["Done"],
  canceled: ["Canceled"],
};

export default function TaskManagementPage({
  useCrmApi = true,
}: TaskManagementPageProps) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const permissions = getCrmPermissions(user?.roles);
  const canReadTask = permissions.task.canRead;
  const canCreateTask = permissions.task.canCreate;
  const canUpdateTask = permissions.task.canUpdate;
  const canDeleteTask = permissions.task.canDelete;
  const createTaskMutation = useCreateCrmTaskMutation();
  const updateTaskMutation = useUpdateCrmTaskMutation();
  const deleteTaskMutation = useDeleteCrmTaskMutation();
  const taskAssigneesQuery = useTaskAssigneesQuery();
  const taskAssignees = useMemo(() => {
    const currentSessionUser = user
      ? {
          name: user.user,
          email: user.email,
          full_name: user.full_name,
          roles: user.roles,
          crm_profile: user.crm_profile,
        }
      : null;
    const users = currentSessionUser
      ? [currentSessionUser, ...(taskAssigneesQuery.data ?? [])]
      : (taskAssigneesQuery.data ?? []);

    return users.filter(
      (candidate, index, allUsers) =>
        allUsers.findIndex((item) => item.name === candidate.name) === index,
    );
  }, [taskAssigneesQuery.data, user]);
  const currentUserId = user?.user || user?.email;
  const shouldUseCrmApi = useCrmApi;
  const [view, setView] = useState<TaskView>("all");
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>("all");
  const [layout, setLayout] = useState<TaskLayout>("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [lanePages, setLanePages] = useState(INITIAL_LANE_PAGES);
  const pendingTaskUpdates = useRef(new Set<string>());
  const hasClientFilters =
    layout === "table" &&
    (view !== "all" || statusFilter !== "all" || searchQuery.trim().length > 0);
  const studentsQuery = useAssignedStudentsQuery(
    {
      admissionYear: 2026,
      page: 1,
      pageSize: 100,
    },
    currentUserId,
    {
      enabled: canCreateTask && !isAuthLoading,
      staleTime: 5 * 60 * 1000,
    },
  );
  const getLanePageLength = (lane: ManagedTaskStatus) =>
    hasClientFilters
      ? 100 + (lanePages[lane] - 1) * TASK_LANE_PAGE_SIZE
      : lanePages[lane] * TASK_LANE_PAGE_SIZE;
  const crmTaskQueryOptions = {
    enabled:
      shouldUseCrmApi &&
      canReadTask &&
      !isAuthLoading &&
      Boolean(currentUserId),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  };
  const todoBacklogQuery = useCrmTasksQuery(
    {
      status: CRM_STATUS_BY_LANE.todo[0],
      start: 0,
      pageLength: getLanePageLength("todo"),
    },
    crmTaskQueryOptions,
  );
  const todoQuery = useCrmTasksQuery(
    {
      status: CRM_STATUS_BY_LANE.todo[1],
      start: 0,
      pageLength: getLanePageLength("todo"),
    },
    crmTaskQueryOptions,
  );
  const inProgressQuery = useCrmTasksQuery(
    {
      status: CRM_STATUS_BY_LANE["in-progress"][0],
      start: 0,
      pageLength: getLanePageLength("in-progress"),
    },
    crmTaskQueryOptions,
  );
  const doneQuery = useCrmTasksQuery(
    {
      status: CRM_STATUS_BY_LANE.done[0],
      start: 0,
      pageLength: getLanePageLength("done"),
    },
    crmTaskQueryOptions,
  );
  const canceledQuery = useCrmTasksQuery(
    {
      status: CRM_STATUS_BY_LANE.canceled[0],
      start: 0,
      pageLength: getLanePageLength("canceled"),
    },
    crmTaskQueryOptions,
  );
  const apiTaskQueries = [
    todoBacklogQuery,
    todoQuery,
    inProgressQuery,
    doneQuery,
    canceledQuery,
  ];
  const apiTaskError = apiTaskQueries.find((query) => query.isError)?.error;
  const apiTasksPending = apiTaskQueries.some((query) => query.isPending);
  const apiTaskTotal = apiTaskQueries.reduce(
    (total, query) => total + (query.data?.total ?? 0),
    0,
  );
  const refetchApiTasks = async () => {
    await Promise.all(apiTaskQueries.map((query) => query.refetch()));
  };
  const apiTasks = useMemo(
    () =>
      mergeTaskLists([
        todoBacklogQuery.data?.tasks ?? [],
        todoQuery.data?.tasks ?? [],
        inProgressQuery.data?.tasks ?? [],
        doneQuery.data?.tasks ?? [],
        canceledQuery.data?.tasks ?? [],
      ]).map((task) =>
        crmTaskToManagementItem(
          task,
          studentsQuery.data?.data ?? [],
          taskAssignees,
        ),
      ),
    [
      canceledQuery.data?.tasks,
      doneQuery.data?.tasks,
      inProgressQuery.data?.tasks,
      studentsQuery.data?.data,
      taskAssignees,
      todoBacklogQuery.data?.tasks,
      todoQuery.data?.tasks,
    ],
  );
  const [localTasks, setLocalTasks] = useState<TaskManagementItem[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<TaskManagementItem | null>(
    null,
  );
  const tasks = shouldUseCrmApi ? apiTasks : localTasks;
  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? null;
  const totalTaskCount = shouldUseCrmApi ? apiTaskTotal : tasks.length;

  const filteredTasks = useMemo(() => {
    const now = new Date();
    const result = tasks.filter((task) => {
      const matchesView =
        view === "all" ||
        (view === "today" && isDueToday(task, now)) ||
        (view === "overdue" && isOverdue(task, now.getTime())) ||
        (view === "upcoming" && isUpcoming(task, now));
      const matchesStatus =
        layout !== "table" ||
        statusFilter === "all" ||
        task.status === statusFilter;
      const normalizedQuery = searchQuery.trim().toLocaleLowerCase("vi-VN");
      const matchesSearch =
        layout !== "table" ||
        normalizedQuery.length === 0 ||
        [
          task.id,
          task.title,
          task.studentName,
          task.studentCode,
          task.assignee,
          task.taskType,
        ].some((value) =>
          value?.toLocaleLowerCase("vi-VN").includes(normalizedQuery),
        );
      return (
        (layout !== "table" || matchesView) && matchesStatus && matchesSearch
      );
    });

    return result.sort((a, b) => dueTimestamp(a) - dueTimestamp(b));
  }, [layout, searchQuery, statusFilter, tasks, view]);

  const filteredTaskCount = hasClientFilters
    ? filteredTasks.length
    : totalTaskCount;
  const visibleTasks = filteredTasks;
  const resetLanePages = () => setLanePages(INITIAL_LANE_PAGES);
  const loadMoreLane = (lane: ManagedTaskStatus) => {
    setLanePages((current) => ({
      ...current,
      [lane]: current[lane] + 1,
    }));
  };
  const getApiLaneQueries = (lane: ManagedTaskStatus) => {
    if (lane === "todo") return [todoBacklogQuery, todoQuery];
    if (lane === "in-progress") return [inProgressQuery];
    if (lane === "done") return [doneQuery];
    return [canceledQuery];
  };
  const getApiLaneTotal = (lane: ManagedTaskStatus) =>
    getApiLaneQueries(lane).reduce(
      (total, query) => total + (query.data?.total ?? 0),
      0,
    );
  const getApiLaneLoadedCount = (lane: ManagedTaskStatus) =>
    getApiLaneQueries(lane).reduce(
      (total, query) => total + (query.data?.tasks.length ?? 0),
      0,
    );
  const lanePagination = shouldUseCrmApi
    ? {
        todo: {
          total: hasClientFilters
            ? visibleTasks.filter((task) => task.status === "todo").length
            : getApiLaneTotal("todo"),
          hasMore: getApiLaneLoadedCount("todo") < getApiLaneTotal("todo"),
          isLoading: getApiLaneQueries("todo").some(
            (query) => query.isFetching,
          ),
          onLoadMore: () => loadMoreLane("todo"),
        },
        "in-progress": {
          total: hasClientFilters
            ? visibleTasks.filter((task) => task.status === "in-progress")
                .length
            : getApiLaneTotal("in-progress"),
          hasMore:
            getApiLaneLoadedCount("in-progress") <
            getApiLaneTotal("in-progress"),
          isLoading: getApiLaneQueries("in-progress").some(
            (query) => query.isFetching,
          ),
          onLoadMore: () => loadMoreLane("in-progress"),
        },
        done: {
          total: hasClientFilters
            ? visibleTasks.filter((task) => task.status === "done").length
            : getApiLaneTotal("done"),
          hasMore: getApiLaneLoadedCount("done") < getApiLaneTotal("done"),
          isLoading: getApiLaneQueries("done").some(
            (query) => query.isFetching,
          ),
          onLoadMore: () => loadMoreLane("done"),
        },
        canceled: {
          total: hasClientFilters
            ? visibleTasks.filter((task) => task.status === "canceled").length
            : getApiLaneTotal("canceled"),
          hasMore:
            getApiLaneLoadedCount("canceled") < getApiLaneTotal("canceled"),
          isLoading: getApiLaneQueries("canceled").some(
            (query) => query.isFetching,
          ),
          onLoadMore: () => loadMoreLane("canceled"),
        },
      }
    : undefined;

  const handleUpdateTask = async (
    id: string,
    updates: Partial<TaskManagementItem>,
  ) => {
    if (!canUpdateTask) {
      toast.error("Bạn không có quyền sửa task.");
      return;
    }
    const currentTask = tasks.find((task) => task.id === id);
    if (!currentTask) return;

    if (!shouldUseCrmApi) {
      setLocalTasks((current) =>
        current.map((task) =>
          task.id === id ? { ...task, ...updates } : task,
        ),
      );
      return;
    }

    if (pendingTaskUpdates.current.has(id)) return;
    pendingTaskUpdates.current.add(id);

    try {
      await updateTaskMutation.mutateAsync(
        studentTaskToUpdatePayload(id, currentTask, updates),
      );
      await refetchApiTasks();
      toast.success("Đã cập nhật task.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể cập nhật task.",
      );
    } finally {
      pendingTaskUpdates.current.delete(id);
    }
  };

  const handleCreateTask = async (task: TaskManagementItem) => {
    if (!canCreateTask) {
      throw new Error("CTV Sale không có quyền tạo task.");
    }
    if (shouldUseCrmApi) {
      if (!task.assigneeId) {
        throw new Error(
          "Student chưa được giao cho Sale/CTV nên chưa thể tạo task.",
        );
      }

      await createTaskMutation.mutateAsync(
        studentTaskToCreatePayload(task, task.studentId, task.assigneeId),
      );

      await refetchApiTasks();
      return;
    }

    setLocalTasks((current) => [task, ...current]);
  };

  const handleRequestDeleteTask = (id: string) => {
    if (!canDeleteTask) return;
    const task = tasks.find((current) => current.id === id);
    if (task) setTaskToDelete(task);
  };

  const handleConfirmDeleteTask = async () => {
    if (!canDeleteTask) return;
    if (!taskToDelete) return;

    if (!shouldUseCrmApi) {
      setLocalTasks((current) =>
        current.filter((task) => task.id !== taskToDelete.id),
      );
      setTaskToDelete(null);
      return;
    }

    try {
      await deleteTaskMutation.mutateAsync(taskToDelete.id);
      await refetchApiTasks();
      setTaskToDelete(null);
      toast.success("Đã xóa task.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể xóa task.",
      );
    }
  };

  const viewCounts = useMemo(() => {
    const now = new Date();
    return {
      all: tasks.length,
      today: tasks.filter((task) => isDueToday(task, now)).length,
      overdue: tasks.filter((task) => isOverdue(task, now.getTime())).length,
      upcoming: tasks.filter((task) => isUpcoming(task, now)).length,
    };
  }, [tasks]);

  return (
    <main
      id="main-content"
      className={
        layout === "kanban"
          ? "flex h-full min-h-0 min-w-0 flex-col gap-4 overflow-hidden px-3 py-4 lg:px-6"
          : "min-w-0 space-y-4 px-3 py-4 pb-8 lg:px-6"
      }
    >
      <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text-primary">
            Quản lý task
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Theo dõi việc cần làm theo từng bước xử lý hồ sơ.
          </p>
        </div>
        {canCreateTask && (
          <Button
            size="md"
            className="self-start sm:self-auto"
            onPress={() => setSheetOpen(true)}
          >
            <Plus size={16} aria-hidden="true" />
            Tạo task
          </Button>
        )}
      </div>

      <div
        className={
          layout === "kanban"
            ? "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-0 p-0 shadow-none"
            : "overflow-hidden"
        }
      >
        <TaskManagementToolbar
          view={view}
          onViewChange={(value) => {
            setView(value);
            resetLanePages();
          }}
          statusFilter={statusFilter}
          onStatusFilterChange={(value) => {
            setStatusFilter(value);
            resetLanePages();
          }}
          layout={layout}
          onLayoutChange={setLayout}
          resultCount={hasClientFilters ? filteredTaskCount : totalTaskCount}
          totalCount={totalTaskCount}
          searchQuery={searchQuery}
          onSearchQueryChange={(value) => {
            setSearchQuery(value);
            resetLanePages();
          }}
        />

        <div className="sr-only" aria-live="polite">
          {viewCounts.today} task hôm nay, {viewCounts.overdue} task quá hạn,{" "}
          {viewCounts.upcoming} task sắp tới.
        </div>
        {apiTaskError && shouldUseCrmApi ? (
          <p
            className="px-5 py-16 text-center text-sm text-input-error"
            role="alert"
          >
            {apiTaskError.message || "Không thể tải danh sách task."}
          </p>
        ) : layout === "kanban" ? (
          <TaskManagementKanban
            tasks={visibleTasks}
            onOpenTask={(task) => setSelectedTaskId(task.id)}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={canDeleteTask ? handleRequestDeleteTask : undefined}
            onCreateTask={canCreateTask ? () => setSheetOpen(true) : undefined}
            lanePagination={lanePagination}
            isLoading={apiTasksPending && shouldUseCrmApi}
          />
        ) : (
          <TaskManagementTable
            key={`${view}-${statusFilter}-${searchQuery}`}
            tasks={visibleTasks}
            onOpenTask={(task) => setSelectedTaskId(task.id)}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={canDeleteTask ? handleRequestDeleteTask : undefined}
            isLoading={apiTasksPending && shouldUseCrmApi}
          />
        )}
      </div>

      <TaskDetailSheet
        isOpen={Boolean(selectedTask)}
        task={selectedTask}
        onUpdateTask={handleUpdateTask}
        onOpenChange={(open) => {
          if (!open) setSelectedTaskId(null);
        }}
      />

      {canCreateTask && (
        <TaskCreateDialog
          isOpen={sheetOpen}
          onOpenChange={setSheetOpen}
          students={studentsQuery.data?.data ?? []}
          isLoadingStudents={
            isAuthLoading || (Boolean(currentUserId) && studentsQuery.isPending)
          }
          studentsError={studentsQuery.error}
          assignees={taskAssignees}
          isLoadingAssignees={taskAssigneesQuery.isPending}
          assigneesError={taskAssigneesQuery.error}
          requireAssignee={shouldUseCrmApi}
          isSubmitting={shouldUseCrmApi && createTaskMutation.isPending}
          onCreate={handleCreateTask}
        />
      )}
      {canDeleteTask && (
        <StudentDeleteTaskDialog
          task={taskToDelete}
          isDeleting={deleteTaskMutation.isPending}
          onOpenChange={(open) => {
            if (!open && !deleteTaskMutation.isPending) setTaskToDelete(null);
          }}
          onConfirm={handleConfirmDeleteTask}
        />
      )}
    </main>
  );
}
