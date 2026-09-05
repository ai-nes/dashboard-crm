"use client";

import { useMemo, useState } from "react";

import { Card } from "@/components/tailgrids/core/card";
import { useAuth } from "@/components/common/auth/auth-provider";
import { useCreateCrmTaskMutation } from "@/hooks/use-crm-tasks-queries";
import { useAssignedStudentsQuery } from "@/hooks/use-students-queries";
import { taskManagementData } from "@/services/api/tasks/data";
import type { TaskManagementItem } from "@/services/api/tasks/types";

import TaskCreateSheet from "./task-create-sheet";
import TaskManagementTable from "./task-management-table";
import TaskManagementToolbar from "./task-management-toolbar";
import type {
  TaskPriorityFilter,
  TaskSort,
  TaskStatusFilter,
  TaskTypeFilter,
  TaskView,
} from "./types";
import { studentTaskToCreatePayload } from "../../students/_components/student-task-mappers";

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

function dueTimestamp(task: TaskManagementItem): number {
  return new Date(`${task.dueDate}T${task.dueTime || "23:59"}`).getTime();
}

function isOverdue(task: TaskManagementItem, now = Date.now()): boolean {
  return task.status !== "done" && dueTimestamp(task) < now;
}

function isDueToday(task: TaskManagementItem, now = new Date()): boolean {
  const due = new Date(`${task.dueDate}T00:00:00`);
  return startOfDay(due) === startOfDay(now);
}

function isUpcoming(task: TaskManagementItem, now = new Date()): boolean {
  const due = new Date(`${task.dueDate}T00:00:00`);
  return !isOverdue(task, now.getTime()) && startOfDay(due) > startOfDay(now);
}

const priorityRank: Record<TaskManagementItem["priority"], number> = {
  Cao: 0,
  "Trung bình": 1,
  Thấp: 2,
};

export default function TaskManagementPage({
  useCrmApi = false,
}: TaskManagementPageProps) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const createTaskMutation = useCreateCrmTaskMutation();
  const currentUserId = user?.user || user?.email;
  const isCtvSaleUser = Boolean(
    user?.roles.includes("CTV Sale") ||
    user?.crm_role === "CTV Sale" ||
    user?.crm_profile === "ctv_sale",
  );
  const shouldUseCrmApi = useCrmApi || isCtvSaleUser;
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
  const [tasks, setTasks] = useState<TaskManagementItem[]>(taskManagementData);
  const [view, setView] = useState<TaskView>("all");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TaskStatusFilter>("all");
  const [priority, setPriority] = useState<TaskPriorityFilter>("all");
  const [taskType, setTaskType] = useState<TaskTypeFilter>("all");
  const [sort, setSort] = useState<TaskSort>("due-asc");
  const [sheetOpen, setSheetOpen] = useState(false);

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
        [
          task.title,
          task.studentName,
          task.studentCode,
          task.studentMajor,
        ]
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

  const handleUpdateTask = (
    id: string,
    updates: Partial<TaskManagementItem>,
  ) => {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, ...updates } : task)),
    );
  };

  const handleCreateTask = async (task: TaskManagementItem) => {
    if (shouldUseCrmApi) {
      const createdTask = await createTaskMutation.mutateAsync(
        studentTaskToCreatePayload(task, task.studentId, currentUserId),
      );

      setTasks((current) => [
        {
          ...task,
          id: createdTask.name || task.id,
          assigneeId: createdTask.assignedTo || task.assigneeId,
        },
        ...current,
      ]);
      return;
    }

    setTasks((current) => [task, ...current]);
  };

  const resetFilters = () => {
    setStatus("all");
    setPriority("all");
    setTaskType("all");
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
            Theo dõi và phân công công việc từ nhiều hồ sơ học sinh trong một
            danh sách tập trung.
          </p>
        </div>
        <div className="rounded-lg border border-card-border bg-card-background px-4 py-3 text-right">
          <p className="text-xs text-text-tertiary">Tổng số task</p>
          <p className="mt-0.5 text-xl font-semibold text-text-primary">
            {tasks.length}
          </p>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <TaskManagementToolbar
          search={search}
          onSearchChange={setSearch}
          view={view}
          onViewChange={setView}
          status={status}
          onStatusChange={setStatus}
          priority={priority}
          onPriorityChange={setPriority}
          taskType={taskType}
          onTaskTypeChange={setTaskType}
          sort={sort}
          onSortChange={setSort}
          onResetFilters={resetFilters}
          resultCount={filteredTasks.length}
          totalCount={tasks.length}
          onCreateTask={() => setSheetOpen(true)}
        />

        <div className="sr-only" aria-live="polite">
          {viewCounts.today} task hôm nay, {viewCounts.overdue} task quá hạn,{" "}
          {viewCounts.upcoming} task sắp tới.
        </div>
        <TaskManagementTable
          tasks={filteredTasks}
          onUpdateTask={handleUpdateTask}
        />
      </Card>

      <TaskCreateSheet
        isOpen={sheetOpen}
        onOpenChange={setSheetOpen}
        students={studentsQuery.data?.data ?? []}
        isLoadingStudents={
          isAuthLoading || (Boolean(currentUserId) && studentsQuery.isPending)
        }
        studentsError={studentsQuery.error}
        assigneeId={shouldUseCrmApi ? currentUserId : undefined}
        assigneeName={shouldUseCrmApi ? user?.full_name : undefined}
        requireAssignee={shouldUseCrmApi}
        isSubmitting={shouldUseCrmApi && createTaskMutation.isPending}
        onCreate={handleCreateTask}
      />
    </main>
  );
}
