import type { StudentStatus } from "@/services/api/students/types";

export const studentStatusOptions: StudentStatus[] = [
  "New",
  "Attempting",
  "Connected",
  "Qualified",
  "Registration",
  "New Enter",
  "Disqualified",
];

export const defaultStudentStatus: StudentStatus = "New";

export const studentStatusLabel: Record<StudentStatus, string> = {
  New: "Mới",
  Attempting: "Đang liên hệ",
  Connected: "Đã kết nối",
  Qualified: "Đủ điều kiện",
  Registration: "Đăng ký",
	"New Enter": "Nhập học",
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
  Registration: "primary",
  "New Enter": "success",
  Disqualified: "error",
};

export const studentStatusTransitions: Record<
  StudentStatus,
  readonly StudentStatus[]
> = {
  New: ["Attempting"],
  Attempting: ["Connected"],
  Connected: ["Qualified", "Disqualified"],
  Qualified: ["Registration"],
  Registration: ["New Enter"],
  "New Enter": [],
  Disqualified: [],
};

export const terminalStudentStatuses: readonly StudentStatus[] = [
  "New Enter",
  "Disqualified",
];

export function isStudentStatusTerminal(
  status: StudentStatus | null | undefined,
): boolean {
  return status ? terminalStudentStatuses.includes(status) : false;
}

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
  Registration:
    "border-transparent bg-badge-primary-background text-badge-primary-text",
  "New Enter":
    "border-transparent bg-badge-success-background text-badge-success-text",
  Disqualified:
    "border-transparent bg-badge-error-background text-badge-error-text",
};
