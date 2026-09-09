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
import type { CRMTask } from "@/services/api/crm-tasks";
import {
  useCreateCrmTaskMutation,
  useCrmTasksQuery,
  useDeleteCrmTaskMutation,
  useUpdateCrmTaskMutation,
} from "@/hooks/use-crm-tasks-queries";
import { useTaskAssigneesQuery } from "@/hooks/use-task-assignees-query";

import SegmentTaskDialog, {
  type SegmentTaskFormValues,
} from "./segment-task-dialog";
import SegmentTaskCard from "./segment-task-card";
import { groupSegmentTasks } from "./segment-task-utils";

function taskMatchesSearch(task: CRMTask, query: string): boolean {
  if (!query) return true;
  return [task.title, task.description, task.actionCode, task.assignedTo].some(
    (value) => value?.toLocaleLowerCase("vi-VN").includes(query),
  );
}

export default function SegmentTasksTab({ segmentId }: { segmentId: string }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const permissions = getCrmPermissions(user?.roles);
  const canReadTask = permissions.task.canRead;
  const canCreateTask = permissions.task.canCreate;
  const canUpdateTask = permissions.task.canUpdate;
  const canDeleteTask = permissions.task.canDelete;
  const [search, setSearch] = useState("");
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
      pageLength: 100,
    },
    {
      enabled: !isAuthLoading && canReadTask,
      staleTime: 30 * 1000,
    },
  );
  const query = search.trim().toLocaleLowerCase("vi-VN");
  const tasks = useMemo(
    () =>
      (taskQuery.data?.tasks ?? []).filter((task) =>
        taskMatchesSearch(task, query),
      ),
    [query, taskQuery.data?.tasks],
  );
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
      onSearchChange={setSearch}
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

  const handleSubmitTask = async (values: SegmentTaskFormValues) => {
    const optional = (value: string) => value.trim() || undefined;

    try {
      if (taskToEdit) {
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
      } else {
        if (!canCreateTask) throw new Error("Bạn không có quyền tạo task.");

        await createTaskMutation.mutateAsync({
          referenceDoctype: "CRM Segment",
          referenceDocname: segmentId,
          title: values.title,
          description: optional(values.description),
          priority: values.priority,
          startDate: optional(values.startDate),
          assignedTo: optional(values.assignedTo),
          status: values.status,
          dueDate: optional(values.dueDate),
        });
        await taskQuery.refetch();
        toast.success("Đã tạo task cho segment.");
      }

      handleTaskDialogChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : taskToEdit
            ? "Không thể cập nhật task."
            : "Không thể tạo task.",
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete || !canDeleteTask) return;

    try {
      await deleteTaskMutation.mutateAsync(taskToDelete.name);
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
                />
              ))}
            </StudentActivityGroup>
          ))}
        </div>
      )}

      <SegmentTaskDialog
        key={`${isTaskDialogOpen ? "open" : "closed"}:${taskToEdit?.name ?? "new"}`}
        isOpen={isTaskDialogOpen}
        task={taskToEdit}
        assignees={taskAssignees}
        isLoadingAssignees={taskAssigneesQuery.isPending}
        assigneesError={taskAssigneesQuery.error}
        isSubmitting={
          createTaskMutation.isPending || updateTaskMutation.isPending
        }
        onOpenChange={handleTaskDialogChange}
        onSubmit={handleSubmitTask}
      />

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
