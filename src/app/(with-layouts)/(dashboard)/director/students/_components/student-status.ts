import type { StudentStatus } from "@/services/api/students/types";

export const studentStatusOptions: StudentStatus[] = [
  "New",
  "Attempting",
  "Connected",
  "Qualified",
  "Disqualified",
];

export const defaultStudentStatus: StudentStatus = "New";

export const studentStatusLabel: Record<StudentStatus, string> = {
  New: "Mới",
  Attempting: "Đang liên hệ",
  Connected: "Đã kết nối",
  Qualified: "Đủ điều kiện",
  Disqualified: "Không đủ điều kiện",
};

export const studentStatusBadgeColor: Record<
  StudentStatus,
  "success" | "error" | "warning" | "primary" | "sky"
> = {
  New: "sky",
  Attempting: "warning",
  Connected: "primary",
  Qualified: "success",
  Disqualified: "error",
};

export const studentStatusTransitions: Record<
  StudentStatus,
  readonly StudentStatus[]
> = {
  New: ["Attempting"],
  Attempting: ["Connected", "Disqualified"],
  Connected: ["Qualified", "Disqualified"],
  Qualified: [],
  Disqualified: [],
};

export function getStudentStatusOptions(
  currentStatus: StudentStatus,
): StudentStatus[] {
  return [currentStatus, ...studentStatusTransitions[currentStatus]];
}

export function canTransitionStudentStatus(
  currentStatus: StudentStatus,
  nextStatus: StudentStatus,
): boolean {
  return (
    currentStatus === nextStatus ||
    studentStatusTransitions[currentStatus].includes(nextStatus)
  );
}

export const studentStatusTriggerClass: Record<StudentStatus, string> = {
  New: "border-transparent bg-badge-sky-background text-badge-sky-text",
  Attempting:
    "border-transparent bg-badge-warning-background text-badge-warning-text",
  Connected:
    "border-transparent bg-badge-primary-background text-badge-primary-text",
  Qualified:
    "border-transparent bg-badge-success-background text-badge-success-text",
  Disqualified:
    "border-transparent bg-badge-error-background text-badge-error-text",
};
