"use client";

import { useId } from "react";
import { toast } from "sonner";

import type { StudentTaskItem } from "@/services/api/students/types";
import { formatDate } from "@/utils/format-date";

import TaskCreateDialogShell from "../../tasks/_components/task-create-dialog-shell";
import TaskCreateForm, {
  type TaskCreateFormValues,
} from "../../tasks/_components/task-create-form";

interface StudentCreateTaskDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  assignee: string;
  assigneeId?: string;
  isAssignmentLocked?: boolean;
  onCreate: (task: StudentTaskItem) => Promise<void>;
  isSubmitting?: boolean;
}

export default function StudentCreateTaskDialog({
  isOpen,
  onOpenChange,
  studentName,
  assignee,
  assigneeId,
  isAssignmentLocked = true,
  onCreate,
  isSubmitting = false,
}: StudentCreateTaskDialogProps) {
  const formId = useId();
  const canCreateTask = isAssignmentLocked && Boolean(assigneeId);

  const handleSubmit = async (values: TaskCreateFormValues) => {
    if (!canCreateTask || !assigneeId) return;

    const [year, month, day] = values.dueDate.split("-");

    try {
      await onCreate({
        id: `task-${formId}-${Date.now()}`,
        title: values.title,
        dueDate:
          year && month && day
            ? `${day}/${month}/${year}`
            : formatDate(values.dueDate),
        dueTime: values.dueTime,
        status: values.status,
        actionCode: values.actionCode,
        priority: values.priority,
        assigneeId,
        assignee,
        notes: values.notes.replace(/<[^>]*>/g, "").trim()
          ? values.notes
          : undefined,
      });
      toast.success(`Đã tạo task cho ${studentName}.`);
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể tạo task.",
      );
    }
  };

  return (
    <TaskCreateDialogShell
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      ariaLabel={`Tạo task cho ${studentName}`}
    >
      <TaskCreateForm
        contextLabel={studentName || "Hồ sơ học sinh"}
        heading="Task mới"
        studentField={
          <div className="flex h-9 items-center px-0 text-sm font-medium text-text-primary">
            {studentName}
          </div>
        }
        assigneeName={assigneeId ? assignee : "Chưa phân công"}
        externalValid={canCreateTask}
        initialDueDate=""
        initialDueTime=""
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={() => onOpenChange(false)}
      />
    </TaskCreateDialogShell>
  );
}
