import type { SessionUser } from "@/services/api/auth";
import type { CRMTask } from "@/services/api/crm-tasks";
import type { StudentListItem } from "@/services/api/students/types";
import { isUuid } from "@/utils/is-uuid";
import { crmTaskToStudentTask } from "../../students/_components/student-task-mappers";

import type { TaskManagementItem } from "@/services/api/tasks/types";

function normalize(value: string | undefined): string {
  return value?.trim().toLocaleLowerCase("vi-VN") ?? "";
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "--";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts.at(-1)?.[0] ?? ""}`.toUpperCase();
}

function isIdentifier(value: string | undefined): boolean {
  return Boolean(
    value && (/^(CK-ID|ENR)-/i.test(value.trim()) || isUuid(value)),
  );
}

function findStudent(task: CRMTask, students: StudentListItem[]) {
  const references = [task.referenceDocname, task.student]
    .map(normalize)
    .filter(Boolean);

  return students.find((student) =>
    [student.id, student.code].some((value) =>
      references.includes(normalize(value)),
    ),
  );
}

export function crmTaskToManagementItem(
  task: CRMTask,
  students: StudentListItem[],
  assignees: SessionUser[],
): TaskManagementItem {
  const student = findStudent(task, students);
  const studentId = student?.id || task.referenceDocname || task.student || "";
  const studentName =
    student?.name ||
    task.studentName ||
    (!isIdentifier(task.student) ? task.student : undefined) ||
    "Học sinh";

  return {
    ...crmTaskToStudentTask(
      task,
      task.assignedTo || "Chưa phân công",
      assignees,
    ),
    actionCode: task.actionCode,
    ownerId: task.owner,
    studentId,
    studentName,
    studentCode: student?.code || task.studentCode || "",
    studentInitials: student?.initials || getInitials(studentName),
    studentMajor: student?.major || "—",
  };
}
