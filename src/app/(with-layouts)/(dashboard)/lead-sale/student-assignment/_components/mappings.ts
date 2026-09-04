import {
  Bolt1,
  CheckCircle1,
  InfoTriangle,
  Layers2,
  Shield1Check,
  UserMultiple1,
} from "@tailgrids/icons";
import type { AssignmentRecord, AssignmentStatus, StepId } from "./types";

export const statusLabels: Record<AssignmentStatus, string> = {
  assigned: "Đã phân công",
  no_match: "Chưa có người phù hợp",
  missing_data: "Thiếu thông tin",
};
export const statusColors = {
  assigned: "success",
  no_match: "warning",
  missing_data: "warning",
} as const;
export const stepIcons = {
  input: UserMultiple1,
  validation: Shield1Check,
  classification: Layers2,
  matching: Bolt1,
  review: InfoTriangle,
  assignment: CheckCircle1,
};
export const toneClasses = {
  neutral: "bg-background-gray-secondary text-text-secondary",
  blue: "bg-badge-sky-background text-badge-sky-text",
  primary: "bg-badge-primary-background text-badge-primary-text",
  warning: "bg-badge-warning-background text-badge-warning-text",
  success: "bg-badge-success-background text-badge-success-text",
};

export function stepMetrics(id: StepId, records: AssignmentRecord[]): string {
  const assigned = records.filter((record) => record.ownerId).length;
  const missing = records.filter(
    (record) => record.status === "missing_data",
  ).length;
  switch (id) {
    case "input":
      return `${records.length} học sinh mới`;
    case "validation":
      return `${records.length - missing} đủ thông tin · ${missing} cần bổ sung`;
    case "classification":
      return `${records.length - missing} học sinh đã phân nhóm`;
    case "matching":
      return `${assigned} đã có người phụ trách`;
    case "review":
      return `${records.length - assigned} học sinh chờ phân công`;
    case "assignment":
      return `${assigned} học sinh đã phân công`;
  }
}
