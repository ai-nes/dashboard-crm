"use client";

import { useState } from "react";
import { toast } from "sonner";

import { DropdownField } from "@/components/common/dropdown-field";
import { Label } from "@/components/tailgrids/core/label";
import type { ScrollToLoadMoreOptions } from "@/hooks/use-scroll-to-load-more";
import type { SessionUser } from "@/services/api/auth";
import type { StudentListItem } from "@/services/api/students/types";
import type { TaskManagementItem } from "@/services/api/tasks/types";

import type { TaskAdmissionYearOption } from "./task-admission-year-options";
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
  admissionYearOptions: TaskAdmissionYearOption[];
  selectedAdmissionYear: number | null;
  onAdmissionYearChange: (year: number | null) => void;
  isLoadingAdmissionYears?: boolean;
  admissionYearsError?: Error | null;
  isStudentOptionsReady: boolean;
  studentPagination?: ScrollToLoadMoreOptions;
  onCreate: (task: TaskManagementItem) => void | Promise<void>;
  isLoadingStudents?: boolean;
  studentsError?: Error | null;
  assignees: SessionUser[];
  isLoadingAssignees?: boolean;
  assigneesError?: Error | null;
  isSubmitting?: boolean;
  requireAssignee?: boolean;
}

export function resolveSelectedTaskStudent(
  students: StudentListItem[],
  studentId: string,
  selectionYear: number | null,
  currentYear: number | null,
): StudentListItem | undefined {
  if (!studentId || selectionYear === null || selectionYear !== currentYear) {
    return undefined;
  }
  return students.find((item) => item.id === studentId);
}

export default function TaskCreateDialog({
  isOpen,
  onOpenChange,
  students,
  admissionYearOptions,
  selectedAdmissionYear,
  onAdmissionYearChange,
  isLoadingAdmissionYears = false,
  admissionYearsError = null,
  isStudentOptionsReady,
  studentPagination,
  onCreate,
  isLoadingStudents = false,
  studentsError = null,
  assignees,
  isLoadingAssignees = false,
  assigneesError = null,
  isSubmitting = false,
  requireAssignee = false,
}: TaskCreateDialogProps) {
  const [studentSelection, setStudentSelection] = useState<{
    admissionYear: number | null;
    studentId: string;
  }>({ admissionYear: null, studentId: "" });
  const student = resolveSelectedTaskStudent(
    students,
    studentSelection.studentId,
    studentSelection.admissionYear,
    selectedAdmissionYear,
  );

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
    selectedAdmissionYear !== null &&
    isStudentOptionsReady &&
    student &&
    assigneeId &&
    (!requireAssignee ||
      (studentTaskAssignee && !isLoadingAssignees && !assigneesError)),
  );

  const handleSubmit = async (values: TaskCreateFormValues) => {
    if (
      selectedAdmissionYear === null ||
      !isStudentOptionsReady ||
      !student ||
      !assigneeId ||
      isSubmitting
    ) return;

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
      setStudentSelection({
        admissionYear: selectedAdmissionYear,
        studentId: "",
      });
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
            <Label htmlFor="task-admission-year">Năm tuyển sinh *</Label>
            <DropdownField
              id="task-admission-year"
              ariaLabel="Chọn năm tuyển sinh"
              options={admissionYearOptions}
              value={
                selectedAdmissionYear === null
                  ? null
                  : String(selectedAdmissionYear)
              }
              onChange={(nextValue) => {
                const nextYear =
                  nextValue && /^\d{4}$/.test(nextValue)
                    ? Number(nextValue)
                    : null;
                if (nextYear === selectedAdmissionYear) return;

                setStudentSelection({
                  admissionYear: nextYear,
                  studentId: "",
                });
                onAdmissionYearChange(nextYear);
              }}
              placeholder="Chọn năm tuyển sinh"
              isDisabled={isLoadingAdmissionYears || admissionYearOptions.length === 0}
              isLoading={isLoadingAdmissionYears}
              isError={Boolean(admissionYearsError)}
              errorMessage={
                admissionYearsError?.message ||
                "Không thể tải danh sách năm tuyển sinh."
              }
              emptyMessage="Chưa có năm tuyển sinh hợp lệ."
              triggerClassName="border-card-border bg-card-background text-sm font-medium shadow-xs"
            />
            {admissionYearsError && (
              <p className="text-xs text-input-error" role="alert">
                {admissionYearsError.message ||
                  "Không thể tải danh sách năm tuyển sinh."}
              </p>
            )}
            <TaskStudentSelect
              key={selectedAdmissionYear ?? "no-admission-year"}
              students={isStudentOptionsReady ? students : []}
              value={studentSelection.studentId}
              onChange={(studentId) =>
                setStudentSelection({
                  admissionYear: selectedAdmissionYear,
                  studentId,
                })
              }
              isDisabled={
                selectedAdmissionYear === null || !isStudentOptionsReady
              }
              isLoading={isLoadingStudents}
              isError={Boolean(studentsError)}
              pagination={studentPagination}
              placeholder={
                selectedAdmissionYear === null
                  ? "Chọn năm tuyển sinh trước"
                  : undefined
              }
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
