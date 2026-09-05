import type { StepId, WorkflowStep } from "./types";

export const automationPath: StepId[] = [
  "input",
  "validation",
  "classification",
  "matching",
  "assignment",
];

export const workflowPositions: Record<StepId, { x: number; y: number }> = {
  input: { x: 0, y: 0 },
  validation: { x: 380, y: 0 },
  classification: { x: 760, y: 0 },
  matching: { x: 1140, y: 0 },
  review: { x: 950, y: 280 },
  assignment: { x: 1520, y: 280 },
};

/**
 * The canvas explains the business pipeline. Its nodes and layout are stable
 * UI definitions; the workspace API may only provide snapshot metrics.
 */
export const workflowSteps: WorkflowStep[] = [
  {
    id: "input",
    title: "Bước 1 · Lead vào hệ thống",
    description: "Tạo CRM Student · pool theo Campus",
    detail: "Tiếp nhận lead, chống trùng và tạo CRM Student thuộc pool mặc định theo Campus.",
    rules: [
      "Kiểm tra trùng qua CRM Student Case Key.",
      "Ghi owning_team và owning_pool theo Campus.",
      "Kích hoạt routing đồng bộ hoặc qua CRM Student Routing Request.",
    ],
    tone: "blue",
    position: workflowPositions.input,
    status: "idle",
    metrics: { processedCount: 0, successCount: 0, warningCount: 0, errorCount: 0 },
  },
  {
    id: "validation",
    title: "Bước 2 · Xác định pool chuẩn",
    description: "Campus · Team · Student Pool",
    detail: "Resolve đúng một Student Pool active khớp Campus và ownership topology của CRM Student.",
    rules: [
      "Pool phải active và thuộc đúng Campus.",
      "Student phải có owning_pool hoặc owning_team.",
      "Topology sai hoặc ambiguous: dừng routing với lỗi canonical.",
    ],
    tone: "neutral",
    position: workflowPositions.validation,
    status: "idle",
    metrics: { processedCount: 0, successCount: 0, warningCount: 0, errorCount: 0 },
  },
  {
    id: "classification",
    title: "Bước 3 · Xác định Zone và Tier",
    description: "High School → Zone → Province",
    detail: "Xác định địa bàn theo thứ tự ưu tiên của trường học, Zone, Province và trạng thái chưa xác định.",
    rules: [
      "Trường có owner active: Tier 1.",
      "Biết Zone nhưng trường chưa có owner: Tier 2.",
      "Chỉ biết Province: Tier 3; không có địa bàn: Tier 4.",
      "Ambiguous hoặc conflicting geography: rơi về enrichment queue.",
    ],
    tone: "blue",
    position: workflowPositions.classification,
    status: "idle",
    metrics: { processedCount: 0, successCount: 0, warningCount: 0, errorCount: 0 },
  },
  {
    id: "matching",
    title: "Bước 4 · Điều phối theo 4 tầng",
    description: "School owner · Zone team · Queue",
    detail: "Áp policy, capacity và chiến lược chọn người; deferred không tự động rơi xuống tầng khác.",
    rules: [
      "Tier 1 ưu tiên school owner và kiểm tra capacity direct.",
      "Tier 2 route vào Zone Team Pool rồi chọn member.",
      "Tier 3 vào MANUAL_QUEUE; Tier 4 vào ENRICHMENT_QUEUE.",
      "Capacity blocked, stale mapping và thiếu policy tạo deferred.",
    ],
    tone: "primary",
    position: workflowPositions.matching,
    status: "idle",
    metrics: { processedCount: 0, successCount: 0, warningCount: 0, errorCount: 0 },
  },
  {
    id: "review",
    title: "Nhánh rẽ · Hàng đợi xử lý thủ công",
    description: "MANUAL_QUEUE · ENRICHMENT_QUEUE · Deferred",
    detail: "Các lead chưa thể tự động gán được giữ trong hàng đợi tương ứng để bổ sung dữ liệu, retry hoặc xử lý thủ công.",
    rules: [
      "Tier 3 chờ Manager phân công thủ công.",
      "Tier 4 cần làm giàu trường, tỉnh hoặc phường.",
      "Deferred chỉ retry theo điều kiện phù hợp, không tự đổi tier.",
    ],
    tone: "warning",
    position: workflowPositions.review,
    status: "idle",
    metrics: { processedCount: 0, successCount: 0, warningCount: 0, errorCount: 0 },
  },
  {
    id: "assignment",
    title: "Bước 5 · Ownership và SLA",
    description: "Owner cá nhân · Receipt · Audit · SLA",
    detail: "Ghi ownership qua command canonical, append audit event và mở SLA khi lead có owner cá nhân.",
    rules: [
      "Chỉ change_student_ownership được ghi owner_staff.",
      "Mỗi command có receipt idempotency và ownership event audit.",
      "Tier 1/2 gán owner thì mở SLA; Tier 3/4 không mở SLA.",
    ],
    tone: "success",
    position: workflowPositions.assignment,
    status: "idle",
    metrics: { processedCount: 0, successCount: 0, warningCount: 0, errorCount: 0 },
  },
];
