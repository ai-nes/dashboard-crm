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
    description: "Lead đã được hệ thống nhận diện để phân công",
    detail:
      "Hệ thống lấy các Lead đã qua bước Xử lý Lead mà chưa có người phụ trách.",
    rules: [
      "Mỗi lần chạy có kết quả riêng để theo dõi.",
      "Thông tin gốc được giữ lại để đối chiếu.",
      "Nguồn tiếp nhận Lead nằm ngoài màn hình này.",
    ],
    tone: "blue",
  },
  validation: {
    title: "Bước 2 · Kiểm tra điều kiện",
    description: "CCCD · Trường THPT · Ngành · Nguồn Lead",
    detail:
      "Điều kiện dữ liệu được kiểm tra ở bước Xử lý Lead; đợt phân công chỉ nhận Lead đã đạt.",
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
    detail: "Hệ thống xác định kết quả xử lý của từng Lead.",
    rules: [
      "Kết quả MATCHED, CREATED hoặc DUPLICATE do hệ thống quyết định.",
      "Người dùng không tự thay đổi kết quả xử lý.",
      "Thông tin gốc của từng Lead vẫn được hiển thị để kiểm tra.",
    ],
    tone: "blue",
  },
  matching: {
    title: "Bước 4 · Tìm Team theo tỉnh",
    description: "Tỉnh · Team phụ trách · Sức chứa",
    detail:
      "Hệ thống tìm các Team đang phụ trách tỉnh của Lead rồi chọn Team có Sale/CTV phù hợp.",
    rules: [
      "Tỉnh của Lead được dùng làm căn cứ tìm Team.",
      "Một tỉnh có thể có nhiều Team cùng phụ trách.",
      "Team không có người đang hoạt động sẽ không được chọn.",
    ],
    tone: "primary",
  },
  review: {
    title: "Ngoại lệ cần xử lý",
    description: "Cần kiểm tra · Tạm hoãn · Lỗi xử lý",
    detail:
      "Các hồ sơ chưa thể phân công được đưa vào danh sách cần kiểm tra hoặc xử lý lại.",
    rules: [
      "Hồ sơ cần kiểm tra phải được bổ sung hoặc xác nhận lại.",
      "Hồ sơ tạm hoãn có thể được xử lý lại khi điều kiện thay đổi.",
      "Hồ sơ lỗi hiển thị mã lỗi và nguyên nhân do hệ thống trả về.",
    ],
    tone: "warning",
  },
  assignment: {
    title: "Bước 5 · Ghi nhận người phụ trách",
    description: "Team · Sale/CTV · Tải hiện tại",
    detail:
      "Kết quả phân công được lưu cùng Team, tỉnh, Sale/CTV và tải tại thời điểm chọn.",
    rules: [
      "Lead Sale chỉ quản lý Team, không được nhận Lead.",
      "Sale và CTV Sale được chọn theo tải hiện tại và giới hạn nhận.",
      "Sau khi phân công, có thể xem lại lý do và người được chọn.",
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
      return `${metrics.processedCount} Lead đã xử lý`;
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
