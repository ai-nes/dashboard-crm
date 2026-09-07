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
  Attempting: "Đang tiếp cận",
  Connected: "Đã kết nối",
  Qualified: "Đủ điều kiện",
  Disqualified: "Không đủ điều kiện",
};

export const studentStatusTriggerClass: Record<StudentStatus, string> = {
  New:
    "border-transparent bg-badge-gray-background text-badge-gray-text",
  Attempting:
    "border-transparent bg-badge-sky-background text-badge-sky-text",
  Connected:
    "border-transparent bg-badge-primary-background text-badge-primary-text",
  Qualified:
    "border-transparent bg-badge-warning-background text-badge-warning-text",
  Disqualified:
    "border-transparent bg-badge-error-background text-badge-error-text",
};
