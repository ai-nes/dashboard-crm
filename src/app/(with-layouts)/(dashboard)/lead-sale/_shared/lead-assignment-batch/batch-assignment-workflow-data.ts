import type {
  LeadAssignmentBatchItemStatus,
  LeadAssignmentWorkflowResponse,
} from "@/services/api/lead-sale";
import { workflowPositions } from "../student-assignment/data";
import type {
  StepId,
  WorkflowPhaseState,
  WorkflowStep,
} from "../student-assignment/types";

export type BatchWorkflowPhaseState = WorkflowPhaseState;

export const batchWorkflowProcessingStepIds = [
  "input",
  "validation",
  "classification",
  "matching",
  "assignment",
] as const satisfies readonly StepId[];

export const batchWorkflowLeadProcessingStepIds = [
  "input",
  "validation",
  "classification",
] as const satisfies readonly StepId[];

// The five visible processing cards should complete in at least three seconds
// altogether, while a slower API run keeps the workflow in its processing state
// until the mutation actually settles.
export const batchWorkflowMinimumProcessingDurationMs = 3000;
export const batchWorkflowProcessingStepDurationMs =
  batchWorkflowMinimumProcessingDurationMs /
  batchWorkflowProcessingStepIds.length;
export const batchWorkflowLeadProcessingStepDurationMs =
  batchWorkflowMinimumProcessingDurationMs /
  batchWorkflowLeadProcessingStepIds.length;

export function getBatchWorkflowProcessingStartIndex(
  steps: WorkflowStep[],
): number {
  const firstIncompleteIndex = batchWorkflowProcessingStepIds.findIndex(
    (stepId) => steps.find((step) => step.id === stepId)?.status !== "success",
  );

  return firstIncompleteIndex === -1
    ? batchWorkflowProcessingStepIds.length - 1
    : firstIncompleteIndex;
}

const retryableStatuses: LeadAssignmentBatchItemStatus[] = [
  "deferred",
  "manual_review",
  "failed",
];

export function getBatchWorkflowSteps(
  workflow: LeadAssignmentWorkflowResponse | null,
): WorkflowStep[] {
  if (!workflow) return [];

  return workflow.steps.map((step) => ({
    ...step,
    position: workflowPositions[step.id],
  }));
}

export function getBatchWorkflowPhaseState(
  step: WorkflowStep,
  currentPhaseId: StepId | null,
): BatchWorkflowPhaseState {
  if (step.status === "success") return "completed";
  if (step.status === "warning" || step.status === "error") {
    return "attention";
  }
  if (step.status === "running" || step.id === currentPhaseId) {
    return "current";
  }
  return "pending";
}

export function getBatchWorkflowCurrentPhaseId(
  steps: WorkflowStep[],
): StepId | null {
  return (
    steps.find((step) => step.status === "running")?.id ??
    steps.find((step) => step.status === "warning" || step.status === "error")
      ?.id ??
    steps.find((step) => step.status === "idle")?.id ??
    null
  );
}

export function getBatchWorkflowStepMetric(step: WorkflowStep): string {
  const { metrics } = step;
  switch (step.id) {
    case "input":
      return `${metrics.processedCount} Lead đã xử lý`;
    case "validation":
      return `${metrics.successCount} hợp lệ · ${metrics.warningCount} cần bổ sung`;
    case "classification":
      return `${metrics.successCount} đã xử lý · ${metrics.errorCount} lỗi`;
    case "matching":
      return `${metrics.successCount} đã có owner`;
    case "review":
      return `${metrics.warningCount + metrics.errorCount} hồ sơ cần lưu ý`;
    case "assignment":
      return `${metrics.successCount} Lead đã phân công`;
  }
}

export function isBatchWorkflowRetryableStatus(
  status: LeadAssignmentBatchItemStatus,
): boolean {
  return retryableStatuses.includes(status);
}
