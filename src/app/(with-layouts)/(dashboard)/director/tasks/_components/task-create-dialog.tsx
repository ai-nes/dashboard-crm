"use client";

import { useState } from "react";
import { toast } from "sonner";

import type { SessionUser } from "@/services/api/auth";
import type { StudentListItem } from "@/services/api/students/types";
import type { TaskManagementItem } from "@/services/api/tasks/types";

import {
  normalizeStudentOwner,
  resolveStudentTaskAssignee,
} from "../../students/_components/student-task-assignee-policy";
import TaskCreateDialogShell from "./task-create-dialog-shell";
import TaskCreateForm, { type TaskCreateFormValues } from "./task-create-form";
import TaskStudentSelect from "./task-student-select";

interface TaskCreateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  students: StudentListItem[];
  onCreate: (task: TaskManagementItem) => void | Promise<void>;
  isLoadingStudents?: boolean;
  studentsError?: Error | null;
  assignees: SessionUser[];
  isLoadingAssignees?: boolean;
  assigneesError?: Error | null;
  isSubmitting?: boolean;
  requireAssignee?: boolean;
}

export default function TaskCreateDialog({
  isOpen,
  onOpenChange,
  students,
  onCreate,
  isLoadingStudents = false,
  studentsError = null,
  assignees,
  isLoadingAssignees = false,
  assigneesError = null,
  isSubmitting = false,
  requireAssignee = false,
}: TaskCreateDialogProps) {
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const selectedStudentId = students.some((item) => item.id === studentId)
    ? studentId
    : (students[0]?.id ?? "");
  const student = students.find((item) => item.id === selectedStudentId);
  const studentOwner = normalizeStudentOwner(student?.owner);
  const studentTaskAssignee = resolveStudentTaskAssignee(
    studentOwner,
    assignees,
  );
  const assigneeId =
    studentTaskAssignee?.name || (!requireAssignee ? studentOwner : undefined);
  const assigneeName =
    studentTaskAssignee?.full_name || studentOwner || "Chưa phân công";
  const canCreateTask = Boolean(
    student &&
    assigneeId &&
    (!requireAssignee ||
      (studentTaskAssignee && !isLoadingAssignees && !assigneesError)),
  );

  const handleSubmit = async (values: TaskCreateFormValues) => {
    if (!student || !assigneeId || isSubmitting) return;

    try {
      await onCreate({
        id: `task-new-${Date.now()}`,
        title: values.title,
        assignee: assigneeName,
        assigneeId,
        dueDate: values.dueDate,
        dueTime: values.dueTime,
        status: values.status,
        priority: values.priority,
        actionCode: values.actionCode,
        notes: values.notes.replace(/<[^>]*>/g, "").trim()
          ? values.notes
          : undefined,
        studentId: student.id,
        studentName: student.name,
        studentCode: student.code,
        studentInitials: student.initials,
        studentMajor: student.major,
      });
      toast.success(`Đã tạo task cho ${student.name}.`);
      setStudentId(students[0]?.id ?? "");
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
      ariaLabel="Tạo task"
    >
      <TaskCreateForm
        contextLabel={student?.name || "Hồ sơ học sinh"}
        heading="Task mới"
        studentField={
          <div className="flex flex-col gap-2">
            <TaskStudentSelect
              students={students}
              value={selectedStudentId}
              onChange={setStudentId}
              isDisabled={students.length === 0}
              isLoading={isLoadingStudents}
              hideLabel
            />
            {studentsError && (
              <p className="text-xs text-input-error" role="alert">
                {studentsError.message || "Không thể tải danh sách học sinh."}
              </p>
            )}
          </div>
        }
        assigneeName={assigneeName}
        externalValid={canCreateTask}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={() => onOpenChange(false)}
      />
    </TaskCreateDialogShell>
  );
}
