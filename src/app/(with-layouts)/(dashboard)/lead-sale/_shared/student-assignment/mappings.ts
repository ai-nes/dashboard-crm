import {
  Bolt1,
  CheckCircle1,
  InfoTriangle,
  Layers2,
  Shield1Check,
  UserMultiple1,
} from "@tailgrids/icons";
import type {
  AssignmentStatus,
  StepId,
  WorkflowPhaseState,
  WorkflowStep,
} from "./types";

export const statusLabels: Record<AssignmentStatus, string> = {
  assigned: "Đã phân công",
  no_match: "Chưa có người phù hợp",
  missing_data: "Thiếu thông tin",
  error: "Lỗi tự động",
};
export const statusColors = {
  assigned: "success",
  no_match: "warning",
  missing_data: "warning",
  error: "error",
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

export const workflowPhaseStateLabels: Record<WorkflowPhaseState, string> = {
  completed: "Đã hoàn tất",
  current: "Phase hiện tại",
  attention: "Cần xử lý",
  pending: "Chưa tới",
};

export const workflowPhaseStateColors = {
  completed: "success",
  current: "primary",
  attention: "warning",
  pending: "gray",
} as const;

export function getCurrentWorkflowPhaseId(
  steps: WorkflowStep[],
): StepId | null {
  return (
    steps.find((step) => step.status === "running")?.id ??
    steps.find((step) => step.status === "error" || step.status === "warning")
      ?.id ??
    steps.find((step) => step.status === "idle")?.id ??
    null
  );
}

export function getWorkflowPhaseState(
  step: WorkflowStep,
  currentPhaseId: StepId | null,
): WorkflowPhaseState {
  if (step.status === "success") return "completed";
  if (step.status === "warning" || step.status === "error") {
    return "attention";
  }
  if (step.status === "running" || step.id === currentPhaseId) {
    return "current";
  }
  return "pending";
}

export function stepMetrics(step: WorkflowStep): string {
  const { metrics } = step;
  switch (step.id) {
    case "input":
      return `${metrics.processedCount} học sinh mới`;
    case "validation":
      return `${metrics.successCount} đủ thông tin · ${metrics.warningCount} cần bổ sung`;
    case "classification":
      return `${metrics.successCount} học sinh đã phân nhóm`;
    case "matching":
      return `${metrics.successCount} đã có người phụ trách`;
    case "review":
      return `${metrics.warningCount + metrics.errorCount} học sinh chờ phân công`;
    case "assignment":
      return `${metrics.successCount} học sinh đã phân công`;
  }
}
