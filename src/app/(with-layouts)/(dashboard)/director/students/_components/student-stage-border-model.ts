import type { StudentAuditLog } from "@/services/api/student-audit";
import type { StudentStatus } from "@/services/api/students/types";
import { studentStatusOptions } from "./student-status";

export interface StudentStageBorderItem {
  status: StudentStatus;
  state: "past" | "current" | "future";
  event?: StudentAuditLog;
}

export function buildStudentStageBorder(
  current: StudentStatus,
  logs: readonly StudentAuditLog[],
): StudentStageBorderItem[] {
  const stages =
    current === "Disqualified"
      ? studentStatusOptions.filter(
          (stage) =>
            !["Qualified", "Registration", "New Enter"].includes(stage),
        )
      : studentStatusOptions.filter((stage) => stage !== "Disqualified");
  const currentIndex = stages.indexOf(current);
  const changes = logs
    .filter(
      (log) =>
        log.doctype === "CRM Student" &&
        log.fieldname === "student_stage" &&
        log.oldValue !== log.newValue,
    )
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));

  return stages.map((status, index) => ({
    status,
    state:
      index === currentIndex
        ? "current"
        : index < currentIndex
          ? "past"
          : "future",
    event: changes.find((log) => log.newValue === status),
  }));
}
