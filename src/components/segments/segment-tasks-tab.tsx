"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import StudentActivityGroup from "@/app/(with-layouts)/(dashboard)/director/students/_components/student-activity-group";
import StudentActivityToolbar, {
  type ActivityExpansionMode,
} from "@/app/(with-layouts)/(dashboard)/director/students/_components/student-activity-toolbar";
import { DeleteRecordDialog } from "@/components/common/delete-record-dialog";
import { useAuth } from "@/components/common/auth/auth-provider";
import { getCrmPermissions } from "@/components/common/auth/permissions";
import { Pagination } from "@/components/tailgrids/core/pagination";
import type {
  CRMTask,
  CRMTaskPriority,
  CRMTaskStatus,
} from "@/services/api/crm-tasks";
import {
  useCreateCrmTaskMutation,
  useCrmTasksQuery,
  useDeleteCrmTaskMutation,
  useUpdateCrmTaskMutation,
} from "@/hooks/use-crm-tasks-queries";
import { useTaskAssigneesQuery } from "@/hooks/use-task-assignees-query";
import type { TaskCreateFormValues } from "@/app/(with-layouts)/(dashboard)/director/tasks/_components/task-create-form";

import SegmentTaskDialog, {
  type SegmentTaskFormValues,
} from "./segment-task-dialog";
import SegmentTaskCard from "./segment-task-card";
import SegmentTaskCreateDialog from "./segment-task-create-dialog";
import { taskCreateFormValuesToSegmentPayload } from "./segment-task-form-mappers";
import { groupSegmentTasks } from "./segment-task-utils";

const PAGE_SIZE = 8;

export default function SegmentTasksTab({
  segmentId,
  segmentName,
}: {
  segmentId: string;
  segmentName?: string;
}) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const permissions = getCrmPermissions(user?.roles);
  const canReadTask = permissions.task.canRead;
  const canCreateTask = permissions.task.canCreate;
  const canUpdateTask = permissions.task.canUpdate;
  const canDeleteTask = permissions.task.canDelete;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [expansionMode, setExpansionMode] =
    useState<ActivityExpansionMode>("collapse");
  const [expandedTaskNames, setExpandedTaskNames] = useState<Set<string>>(
    () => new Set(),
  );
  const [collapsedTaskNames, setCollapsedTaskNames] = useState<Set<string>>(
    () => new Set(),
  );
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<CRMTask | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<CRMTask | null>(null);
  const createTaskMutation = useCreateCrmTaskMutation();
  const updateTaskMutation = useUpdateCrmTaskMutation();
  const deleteTaskMutation = useDeleteCrmTaskMutation();
  const taskAssigneesQuery = useTaskAssigneesQuery();
  const taskAssignees = useMemo(() => {
    const currentUser = user
      ? {
          name: user.user,
          email: user.email,
          full_name: user.full_name,
          roles: user.roles,
          crm_profile: user.crm_profile,
        }
      : null;
    const users = currentUser
      ? [currentUser, ...(taskAssigneesQuery.data ?? [])]
      : (taskAssigneesQuery.data ?? []);

    return users.filter(
      (candidate, index, allUsers) =>
        allUsers.findIndex((item) => item.name === candidate.name) === index,
    );
  }, [taskAssigneesQuery.data, user]);
  const taskQuery = useCrmTasksQuery(
    {
      referenceDoctype: "CRM Segment",
      referenceDocname: segmentId,
      search: search.trim() || undefined,
      start: (page - 1) * PAGE_SIZE,
      pageLength: PAGE_SIZE,
    },
    {
      enabled: !isAuthLoading && canReadTask,
      staleTime: 30 * 1000,
    },
  );
  const query = search.trim();
  const tasks = useMemo(
    () => taskQuery.data?.tasks ?? [],
    [taskQuery.data?.tasks],
  );
  const total = taskQuery.data?.total ?? tasks.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const firstTask = total ? (page - 1) * PAGE_SIZE + 1 : 0;
  const lastTask = Math.min(page * PAGE_SIZE, total);
  const taskGroups = useMemo(() => groupSegmentTasks(tasks), [tasks]);

  const isTaskMutationPending =
    createTaskMutation.isPending ||
    updateTaskMutation.isPending ||
    deleteTaskMutation.isPending;

  const handleTaskDialogChange = (open: boolean) => {
    setIsTaskDialogOpen(open);
    if (!open) setTaskToEdit(null);
  };

  const openCreateTask = () => {
    if (!canCreateTask) {
      toast.error("Bạn không có quyền tạo task.");
      return;
    }
    setTaskToEdit(null);
    setIsTaskDialogOpen(true);
  };

  const openEditTask = (task: CRMTask) => {
    if (!canUpdateTask) {
      toast.error("Bạn không có quyền sửa task.");
      return;
    }
    setTaskToEdit(task);
    setIsTaskDialogOpen(true);
  };

  const handleToggleStatus = async (task: CRMTask) => {
    if (!canUpdateTask) {
      toast.error("Bạn không có quyền sửa task.");
      return;
    }

    try {
      await updateTaskMutation.mutateAsync({
        name: task.name,
        status:
          task.status === "Done" || task.status === "Canceled"
            ? "Todo"
            : "Done",
      });
      await taskQuery.refetch();
      toast.success(
        task.status === "Done"
          ? "Đã mở lại task."
          : task.status === "Canceled"
            ? "Đã khôi phục task."
            : "Đã hoàn thành task.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể cập nhật task.",
      );
    }
  };

  const handleExpansionModeChange = (mode: ActivityExpansionMode) => {
    setExpansionMode(mode);
    setExpandedTaskNames(
      new Set(mode === "expand" ? tasks.map((task) => task.name) : []),
    );
    setCollapsedTaskNames(new Set());
  };

  const handleTaskExpandedChange = (name: string, expanded: boolean) => {
    if (expansionMode === "expand") {
      setCollapsedTaskNames((current) => {
        const next = new Set(current);
        if (expanded) next.delete(name);
        else next.add(name);
        return next;
      });
      return;
    }

    setExpandedTaskNames((current) => {
      const next = new Set(current);
      if (expanded) next.add(name);
      else next.delete(name);
      return next;
    });
  };

  const isTaskExpanded = (name: string) =>
    expansionMode === "expand"
      ? !collapsedTaskNames.has(name)
      : expandedTaskNames.has(name);

  const taskToolbar = (
    <StudentActivityToolbar
      search={search}
      onSearchChange={(value) => {
        setSearch(value);
        setPage(1);
      }}
      searchPlaceholder="Tìm task..."
      searchLabel="Tìm task của segment"
      expansionMode={expansionMode}
      onExpansionModeChange={handleExpansionModeChange}
      onCreate={openCreateTask}
      createLabel="Tạo task"
      isCreateDisabled={!canCreateTask}
      createDisabledReason="Bạn không có quyền tạo task."
    />
  );

  const handleUpdateTask = async (values: SegmentTaskFormValues) => {
    try {
      if (!taskToEdit) throw new Error("Không tìm thấy task cần cập nhật.");
      if (!canUpdateTask) throw new Error("Bạn không có quyền sửa task.");

      await updateTaskMutation.mutateAsync({
        name: taskToEdit.name,
        title: values.title,
        description: values.description.trim(),
        priority: values.priority,
        startDate: values.startDate,
        assignedTo: values.assignedTo,
        status: values.status,
        dueDate: values.dueDate,
      });
      await taskQuery.refetch();
      toast.success("Đã cập nhật task.");

      handleTaskDialogChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể cập nhật task.",
      );
    }
  };

  const updateTaskFields = async (
    task: CRMTask,
    updates: Pick<CRMTask, "status" | "priority">,
    successMessage: string,
  ) => {
    if (!canUpdateTask) {
      toast.error("Bạn không có quyền sửa task.");
      return;
    }

    try {
      await updateTaskMutation.mutateAsync({ name: task.name, ...updates });
      await taskQuery.refetch();
      toast.success(successMessage);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể cập nhật task.",
      );
    }
  };

  const handleStatusChange = async (task: CRMTask, status: CRMTaskStatus) => {
    await updateTaskFields(task, { status }, "Đã cập nhật trạng thái task.");
  };

  const handlePriorityChange = async (
    task: CRMTask,
    priority: CRMTaskPriority,
  ) => {
    await updateTaskFields(task, { priority }, "Đã cập nhật mức ưu tiên task.");
  };

  const handleCreateTask = async (values: TaskCreateFormValues) => {
    try {
      if (!canCreateTask) throw new Error("Bạn không có quyền tạo task.");

      await createTaskMutation.mutateAsync({
        referenceDoctype: "CRM Segment",
        referenceDocname: segmentId,
        ...taskCreateFormValuesToSegmentPayload(values),
      });
      await taskQuery.refetch();
      toast.success("Đã tạo task cho segment.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể tạo task.",
      );
      throw error;
    }
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete || !canDeleteTask) return;

    try {
      const shouldMoveToPreviousPage = tasks.length === 1 && page > 1;
      await deleteTaskMutation.mutateAsync(taskToDelete.name);
      if (shouldMoveToPreviousPage) setPage(page - 1);
      await taskQuery.refetch();
      setTaskToDelete(null);
      toast.success("Đã xóa task.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể xóa task.",
      );
    }
  };

  return (
    <section className="space-y-5" aria-labelledby="segment-tasks-heading">
      <div>
        <div>
          <h2
            id="segment-tasks-heading"
            className="text-base font-semibold text-text-primary"
          >
            Task của segment
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Theo dõi các công việc được gắn với segment này.
          </p>
        </div>
      </div>

      {!isAuthLoading && !canReadTask ? (
        <div className="space-y-4">
          {taskToolbar}
          <p className="py-2 text-xs text-text-tertiary">
            Bạn không có quyền xem task của segment này.
          </p>
        </div>
      ) : taskQuery.isPending ? (
        <div className="space-y-4">
          {taskToolbar}
          <p className="py-2 text-xs text-text-tertiary">Đang tải task…</p>
        </div>
      ) : taskQuery.isError ? (
        <div className="space-y-4">
          {taskToolbar}
          <p className="py-2 text-xs text-error-600" role="alert">
            Không thể tải task: {taskQuery.error.message}
          </p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="space-y-4">
          {taskToolbar}
          <p className="py-2 text-xs text-text-tertiary">
            {query
              ? "Không tìm thấy task phù hợp."
              : "Segment chưa có task nào."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {taskToolbar}
          {taskGroups.map((group) => (
            <StudentActivityGroup
              key={group.id}
              id={`segment-tasks-group-${group.id}`}
              label={group.label}
              count={group.tasks.length}
              tone={group.id === "overdue" ? "danger" : "default"}
            >
              {group.tasks.map((task) => (
                <SegmentTaskCard
                  key={task.name}
                  task={task}
                  canUpdate={canUpdateTask}
                  canDelete={canDeleteTask}
                  isActionPending={isTaskMutationPending}
                  expanded={isTaskExpanded(task.name)}
                  onExpandedChange={(expanded) =>
                    handleTaskExpandedChange(task.name, expanded)
                  }
                  onEdit={openEditTask}
                  onDelete={setTaskToDelete}
                  onToggleStatus={handleToggleStatus}
                  onStatusChange={handleStatusChange}
                  onPriorityChange={handlePriorityChange}
                />
              ))}
            </StudentActivityGroup>
          ))}
          <footer className="flex flex-col gap-3 border-t border-card-border px-1 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p
              aria-live="polite"
              className="shrink-0 whitespace-nowrap text-xs text-text-secondary"
            >
              Hiển thị{" "}
              <span className="font-semibold text-text-primary">
                {firstTask.toLocaleString("vi-VN")}–
                {lastTask.toLocaleString("vi-VN")}
              </span>{" "}
              trong tổng số{" "}
              <span className="font-semibold text-text-primary">
                {total.toLocaleString("vi-VN")}
              </span>{" "}
              task
            </p>
            <div className="flex shrink-0 items-center justify-end max-sm:w-full">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                variant="compact"
                isDisabled={taskQuery.isFetching}
              />
            </div>
          </footer>
        </div>
      )}

      {taskToEdit ? (
        <SegmentTaskDialog
          key={`${isTaskDialogOpen ? "open" : "closed"}:${taskToEdit.name}`}
          isOpen={isTaskDialogOpen}
          task={taskToEdit}
          assignees={taskAssignees}
          isLoadingAssignees={taskAssigneesQuery.isPending}
          assigneesError={taskAssigneesQuery.error}
          isSubmitting={updateTaskMutation.isPending}
          onOpenChange={handleTaskDialogChange}
          onSubmit={handleUpdateTask}
        />
      ) : (
        <SegmentTaskCreateDialog
          key={`${isTaskDialogOpen ? "open" : "closed"}:new`}
          isOpen={isTaskDialogOpen}
          segmentName={segmentName || "Segment hiện tại"}
          isSubmitting={createTaskMutation.isPending}
          onOpenChange={handleTaskDialogChange}
          onSubmit={handleCreateTask}
        />
      )}

      <DeleteRecordDialog
        isOpen={Boolean(taskToDelete)}
        recordType="task"
        recordName={taskToDelete?.title ?? ""}
        isDeleting={deleteTaskMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setTaskToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      >
        <p className="text-sm text-text-secondary">
          Task sẽ được xóa khỏi segment này.
        </p>
      </DeleteRecordDialog>
    </section>
  );
}
