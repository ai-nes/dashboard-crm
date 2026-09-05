"use client";

import { useMemo, useRef, useState } from "react";
import { keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";

import { Card } from "@/components/tailgrids/core/card";
import { Pagination } from "@/components/tailgrids/core/pagination";
import { useAuth } from "@/components/common/auth/auth-provider";
import {
  useCreateCrmTaskMutation,
  useCrmTasksQuery,
  useDeleteCrmTaskMutation,
  useUpdateCrmTaskMutation,
} from "@/hooks/use-crm-tasks-queries";
import { useTaskAssigneesQuery } from "@/hooks/use-task-assignees-query";
import { useAssignedStudentsQuery } from "@/hooks/use-students-queries";
import type { TaskManagementItem } from "@/services/api/tasks/types";

import TaskCreateSheet from "./task-create-sheet";
import TaskManagementTable from "./task-management-table";
import TaskManagementToolbar from "./task-management-toolbar";
import StudentDeleteTaskDialog from "../../students/_components/student-delete-task-dialog";
import { crmTaskToManagementItem } from "./task-management-mappers";
import type {
  TaskPriorityFilter,
  TaskSort,
  TaskStatusFilter,
  TaskTypeFilter,
  TaskView,
} from "./types";
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

const priorityRank: Record<TaskManagementItem["priority"], number> = {
  Cao: 0,
  "Trung bình": 1,
  Thấp: 2,
};

const TASK_PAGE_SIZE = 10;

export default function TaskManagementPage({
  useCrmApi = true,
}: TaskManagementPageProps) {
  const { user, isLoading: isAuthLoading } = useAuth();
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
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TaskStatusFilter>("all");
  const [priority, setPriority] = useState<TaskPriorityFilter>("all");
  const [taskType, setTaskType] = useState<TaskTypeFilter>("all");
  const [sort, setSort] = useState<TaskSort>("due-asc");
  const [page, setPage] = useState(1);
  const pendingTaskUpdates = useRef(new Set<string>());
  const hasClientFilters = Boolean(
    search.trim() ||
    view !== "all" ||
    status !== "all" ||
    priority !== "all" ||
    taskType !== "all" ||
    sort !== "due-asc",
  );
  const studentsQuery = useAssignedStudentsQuery(
    {
      admissionYear: 2026,
      page: 1,
      pageSize: 100,
    },
    currentUserId,
    {
      enabled: !isAuthLoading,
      staleTime: 5 * 60 * 1000,
    },
  );
  const taskQueryParams = useMemo(
    () =>
      hasClientFilters
        ? { start: 0, pageLength: 100 }
        : { start: (page - 1) * TASK_PAGE_SIZE, pageLength: TASK_PAGE_SIZE },
    [hasClientFilters, page],
  );
  const tasksQuery = useCrmTasksQuery(taskQueryParams, {
    enabled: shouldUseCrmApi && !isAuthLoading && Boolean(currentUserId),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });
  const apiTasks = useMemo(
    () =>
      (tasksQuery.data?.tasks ?? []).map((task) =>
        crmTaskToManagementItem(
          task,
          studentsQuery.data?.data ?? [],
          taskAssignees,
        ),
      ),
    [studentsQuery.data?.data, taskAssignees, tasksQuery.data?.tasks],
  );
  const [localTasks, setLocalTasks] = useState<TaskManagementItem[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<TaskManagementItem | null>(
    null,
  );
  const tasks = shouldUseCrmApi ? apiTasks : localTasks;
  const totalTaskCount = tasksQuery.data?.total ?? tasks.length;

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    const now = new Date();
    const result = tasks.filter((task) => {
      const matchesView =
        view === "all" ||
        (view === "today" && isDueToday(task, now)) ||
        (view === "overdue" && isOverdue(task, now.getTime())) ||
        (view === "upcoming" && isUpcoming(task, now));
      const matchesStatus = status === "all" || task.status === status;
      const matchesPriority = priority === "all" || task.priority === priority;
      const matchesType =
        taskType === "all" || (task.taskType ?? "todo") === taskType;
      const matchesSearch =
        !query ||
        [task.title, task.studentName, task.studentCode, task.studentMajor]
          .join(" ")
          .toLowerCase()
          .includes(query);
      return (
        matchesView &&
        matchesStatus &&
        matchesPriority &&
        matchesType &&
        matchesSearch
      );
    });

    return result.sort((a, b) => {
      if (sort === "priority")
        return priorityRank[a.priority] - priorityRank[b.priority];
      if (sort === "student")
        return a.studentName.localeCompare(b.studentName, "vi");
      const difference = dueTimestamp(a) - dueTimestamp(b);
      return sort === "due-desc" ? difference * -1 : difference;
    });
  }, [tasks, view, search, status, priority, taskType, sort]);

  const filteredTaskCount = hasClientFilters
    ? filteredTasks.length
    : totalTaskCount;
  const totalPages = Math.max(1, Math.ceil(filteredTaskCount / TASK_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const visibleTasks = hasClientFilters
    ? filteredTasks.slice(
        (currentPage - 1) * TASK_PAGE_SIZE,
        currentPage * TASK_PAGE_SIZE,
      )
    : filteredTasks;

  const handlePageChange = (nextPage: number) => {
    setPage(Math.min(Math.max(1, nextPage), totalPages));
  };

  const handleUpdateTask = async (
    id: string,
    updates: Partial<TaskManagementItem>,
  ) => {
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
    if (shouldUseCrmApi) {
      if (!task.assigneeId) {
        throw new Error(
          "Student chưa được giao cho Sale/CTV nên chưa thể tạo task.",
        );
      }

      await createTaskMutation.mutateAsync(
        studentTaskToCreatePayload(task, task.studentId, task.assigneeId),
      );

      await tasksQuery.refetch();
      return;
    }

    setLocalTasks((current) => [task, ...current]);
  };

  const handleRequestDeleteTask = (id: string) => {
    const task = tasks.find((current) => current.id === id);
    if (task) setTaskToDelete(task);
  };

  const handleConfirmDeleteTask = async () => {
    if (!taskToDelete) return;
    const shouldGoToPreviousPage = visibleTasks.length === 1 && page > 1;

    if (!shouldUseCrmApi) {
      setLocalTasks((current) =>
        current.filter((task) => task.id !== taskToDelete.id),
      );
      if (shouldGoToPreviousPage) setPage(page - 1);
      setTaskToDelete(null);
      return;
    }

    try {
      await deleteTaskMutation.mutateAsync(taskToDelete.id);
      if (shouldGoToPreviousPage) setPage(page - 1);
      setTaskToDelete(null);
      toast.success("Đã xóa task.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể xóa task.",
      );
    }
  };

  const resetFilters = () => {
    setSearch("");
    setView("all");
    setStatus("all");
    setPriority("all");
    setTaskType("all");
    setSort("due-asc");
    setPage(1);
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
      className="min-w-0 space-y-5 px-2 py-4 pb-10 lg:px-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary-500">
            Vận hành tuyển sinh
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text-primary lg:text-[28px]">
            Quản lý task
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
            Theo dõi task và hạn xử lý theo từng hồ sơ.
          </p>
        </div>
        <div className="rounded-lg border border-card-border bg-card-background px-4 py-3 text-right">
          <p className="text-xs text-text-tertiary">Tổng số task</p>
          <p className="mt-0.5 text-xl font-semibold text-text-primary">
            {tasksQuery.data?.total ?? tasks.length}
          </p>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <TaskManagementToolbar
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          view={view}
          onViewChange={(value) => {
            setView(value);
            setPage(1);
          }}
          status={status}
          onStatusChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
          priority={priority}
          onPriorityChange={(value) => {
            setPriority(value);
            setPage(1);
          }}
          taskType={taskType}
          onTaskTypeChange={(value) => {
            setTaskType(value);
            setPage(1);
          }}
          sort={sort}
          onSortChange={(value) => {
            setSort(value);
            setPage(1);
          }}
          onResetFilters={resetFilters}
          resultCount={hasClientFilters ? filteredTaskCount : totalTaskCount}
          totalCount={totalTaskCount}
          onCreateTask={() => setSheetOpen(true)}
        />

        <div className="sr-only" aria-live="polite">
          {viewCounts.today} task hôm nay, {viewCounts.overdue} task quá hạn,{" "}
          {viewCounts.upcoming} task sắp tới.
        </div>
        {tasksQuery.isPending && shouldUseCrmApi ? (
          <p className="px-5 py-16 text-center text-sm text-text-tertiary">
            Đang tải task...
          </p>
        ) : tasksQuery.isError && shouldUseCrmApi ? (
          <p
            className="px-5 py-16 text-center text-sm text-input-error"
            role="alert"
          >
            {tasksQuery.error.message || "Không thể tải danh sách task."}
          </p>
        ) : (
          <TaskManagementTable
            tasks={visibleTasks}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleRequestDeleteTask}
          />
        )}

        {filteredTaskCount > 0 && totalPages > 1 && (
          <div className="flex flex-col gap-3 border-t border-card-border px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between lg:px-5">
            <p className="text-xs text-text-secondary" aria-live="polite">
              Hiển thị{" "}
              <span className="font-semibold text-text-primary">
                {(currentPage - 1) * TASK_PAGE_SIZE + 1}–
                {Math.min(currentPage * TASK_PAGE_SIZE, filteredTaskCount)}
              </span>{" "}
              trong tổng số{" "}
              <span className="font-semibold text-text-primary">
                {filteredTaskCount}
              </span>{" "}
              task
            </p>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              variant="compact"
              isDisabled={tasksQuery.isFetching}
              className="max-sm:gap-3"
            />
          </div>
        )}
      </Card>

      <TaskCreateSheet
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
      <StudentDeleteTaskDialog
        task={taskToDelete}
        isDeleting={deleteTaskMutation.isPending}
        onOpenChange={(open) => {
          if (!open && !deleteTaskMutation.isPending) setTaskToDelete(null);
        }}
        onConfirm={handleConfirmDeleteTask}
      />
    </main>
  );
}
