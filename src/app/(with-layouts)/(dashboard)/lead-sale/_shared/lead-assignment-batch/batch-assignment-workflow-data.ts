import type {
  LeadAssignmentBatch,
  LeadAssignmentBatchItemStatus,
} from "@/services/api/lead-sale";
import { workflowPositions } from "../student-assignment/data";
import type {
  StepId,
  WorkflowPhaseState,
  WorkflowStep,
} from "../student-assignment/types";

export type BatchWorkflowPhaseState = WorkflowPhaseState;

const stepDefinitions: Record<
  StepId,
  Pick<WorkflowStep, "title" | "description" | "detail" | "rules" | "tone">
> = {
  input: {
    title: "Bước 1 · Tiếp nhận Lead",
    description: "Lead đã được đưa vào đợt phân công",
    detail:
      "Hệ thống gom các Lead thành từng đợt để kiểm tra và phân công độc lập.",
    rules: [
      "Mỗi đợt có tên riêng để theo dõi.",
      "Thông tin gốc được giữ lại để đối chiếu.",
      "Trang này chỉ theo dõi các đợt đã được tạo từ luồng tiếp nhận Lead.",
    ],
    tone: "blue",
  },
  validation: {
    title: "Bước 2 · Kiểm tra điều kiện",
    description: "CCCD · Trường THPT · Ngành · Nguồn Lead",
    detail:
      "Hệ thống kiểm tra các trường bắt buộc trước khi cho phép phân công.",
    rules: [
      "Hồ sơ thiếu trường bắt buộc được giữ lại để người dùng xử lý.",
      "Hệ thống không tự bổ sung hoặc suy đoán thông tin.",
      "Đợt chỉ chuyển sang trạng thái đã kiểm tra khi hệ thống hoàn tất bước này.",
    ],
    tone: "neutral",
  },
  classification: {
    title: "Bước 3 · Xác định kết quả xử lý",
    description: "MATCHED · CREATED · DUPLICATE",
    detail: "Hệ thống xác định kết quả xử lý của từng Lead trong đợt.",
    rules: [
      "Kết quả MATCHED, CREATED hoặc DUPLICATE do hệ thống quyết định.",
      "Người dùng không tự thay đổi kết quả xử lý.",
      "Thông tin gốc của từng Lead vẫn được hiển thị để kiểm tra.",
    ],
    tone: "blue",
  },
  matching: {
    title: "Bước 4 · Xác định tuyến phân công",
    description: "Trường · Khu vực · Đội · Sức chứa",
    detail:
      "Hệ thống xác định tuyến phân công dựa trên trường, khu vực, đội và sức chứa.",
    rules: [
      "Tuyến và người phụ trách do hệ thống quyết định.",
      "Kết quả phân công đi kèm phiên bản quy tắc đã áp dụng.",
      "Thiếu sức chứa hoặc thông tin tuyến có thể khiến hồ sơ tạm hoãn.",
    ],
    tone: "primary",
  },
  review: {
    title: "Ngoại lệ cần xử lý",
    description: "Cần kiểm tra · Tạm hoãn · Lỗi xử lý",
    detail:
      "Các hồ sơ chưa thể phân công tự động được đưa vào danh sách cần kiểm tra hoặc xử lý lại.",
    rules: [
      "Hồ sơ cần kiểm tra phải được bổ sung hoặc xác nhận lại.",
      "Hồ sơ tạm hoãn có thể được xử lý lại khi điều kiện thay đổi.",
      "Hồ sơ lỗi hiển thị mã lỗi và nguyên nhân do hệ thống trả về.",
    ],
    tone: "warning",
  },
  assignment: {
    title: "Bước 5 · Ghi nhận người phụ trách",
    description: "Đội · Tư vấn viên · Sức chứa · Quy tắc",
    detail:
      "Kết quả phân công được lưu cùng thông tin tuyến để đối chiếu và truy vết.",
    rules: [
      "Hiển thị tư vấn viên và đội khi hệ thống đã phân công.",
      "Giữ mã yêu cầu và phiên bản quy tắc để truy vết.",
      "Sau khi phân công, tải lại chi tiết để nhận kết quả cuối.",
    ],
    tone: "success",
  },
};

const retryableStatuses: LeadAssignmentBatchItemStatus[] = [
  "deferred",
  "manual_review",
  "failed",
];

function itemAttentionCount(batch: LeadAssignmentBatch): number {
  return (
    batch.summary.deferred + batch.summary.manualReview + batch.summary.failed
  );
}

function statusForStep(
  batch: LeadAssignmentBatch | null,
  stepId: StepId,
): WorkflowStep["status"] {
  if (!batch) return "idle";

  const attentionCount = itemAttentionCount(batch);
  const hasLead = batch.summary.total > 0;
  const reviewStatus = attentionCount > 0 ? "warning" : "success";

  switch (batch.status) {
    case "draft":
      return stepId === "input"
        ? hasLead
          ? "success"
          : "idle"
        : stepId === "validation" && hasLead
          ? "running"
          : "idle";
    case "ready":
      if (
        stepId === "input" ||
        stepId === "validation" ||
        stepId === "classification" ||
        stepId === "matching"
      ) {
        return "success";
      }
      return stepId === "review" ? reviewStatus : "idle";
    case "running":
      if (
        stepId === "input" ||
        stepId === "validation" ||
        stepId === "classification" ||
        stepId === "matching"
      ) {
        return "success";
      }
      if (stepId === "assignment") return "running";
      return stepId === "review" && attentionCount > 0 ? "warning" : "idle";
    case "completed":
      return "success";
    case "completed_with_errors":
      if (stepId === "review") return "warning";
      return stepId === "assignment" && batch.summary.assigned === 0
        ? "error"
        : "success";
    case "cancelled":
      return stepId === "assignment"
        ? "error"
        : stepId === "input"
          ? "success"
          : "idle";
  }
}

function metricsForStep(
  batch: LeadAssignmentBatch | null,
  stepId: StepId,
): WorkflowStep["metrics"] {
  const summary = batch?.summary;
  if (!summary) {
    return {
      processedCount: 0,
      successCount: 0,
      warningCount: 0,
      errorCount: 0,
    };
  }

  const attention = summary.deferred + summary.manualReview;
  switch (stepId) {
    case "input":
      return {
        processedCount: summary.total,
        successCount: summary.total,
        warningCount: summary.invalid,
        errorCount: 0,
      };
    case "validation":
      return {
        processedCount: summary.total,
        successCount: summary.valid,
        warningCount: summary.invalid,
        errorCount: 0,
      };
    case "classification":
      return {
        processedCount: summary.valid,
        successCount: Math.max(0, summary.valid - summary.failed),
        warningCount: attention,
        errorCount: summary.failed,
      };
    case "matching":
      return {
        processedCount: summary.valid,
        successCount: summary.assigned,
        warningCount: attention,
        errorCount: summary.failed,
      };
    case "review":
      return {
        processedCount: attention + summary.failed,
        successCount: 0,
        warningCount: attention,
        errorCount: summary.failed,
      };
    case "assignment":
      return {
        processedCount: summary.total,
        successCount: summary.assigned,
        warningCount: attention,
        errorCount: summary.failed,
      };
  }
}

export function getBatchWorkflowSteps(
  batch: LeadAssignmentBatch | null,
): WorkflowStep[] {
  return (Object.keys(stepDefinitions) as StepId[]).map((id) => ({
    id,
    ...stepDefinitions[id],
    position: workflowPositions[id],
    status: statusForStep(batch, id),
    metrics: metricsForStep(batch, id),
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
      return `${metrics.processedCount} Lead trong đợt`;
    case "validation":
      return `${metrics.successCount} hợp lệ · ${metrics.warningCount} cần bổ sung`;
    case "classification":
      return `${metrics.successCount} đã xử lý · ${metrics.errorCount} lỗi`;
    case "matching":
      return `${metrics.successCount} đã có owner`;
    case "review":
      return `${metrics.warningCount + metrics.errorCount} hồ sơ cần xử lý`;
    case "assignment":
      return `${metrics.successCount} Lead đã phân công`;
  }
}

export function isBatchWorkflowRetryableStatus(
  status: LeadAssignmentBatchItemStatus,
): boolean {
  return retryableStatuses.includes(status);
}
