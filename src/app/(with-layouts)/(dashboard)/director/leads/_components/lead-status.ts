export type LeadStageStatus = "NEW" | "PROCESSED" | "ASSIGNED" | "CLOSED";

export const leadStageStatusLabel: Record<LeadStageStatus, string> = {
  NEW: "Mới",
  PROCESSED: "Đang xử lý",
  ASSIGNED: "Đã phân công",
  CLOSED: "Đã đóng",
};

export const leadStageStatusColor: Record<
  LeadStageStatus,
  "gray" | "sky" | "warning" | "success"
> = {
  NEW: "gray",
  PROCESSED: "sky",
  ASSIGNED: "warning",
  CLOSED: "success",
};

export const leadStageStatusOptions: LeadStageStatus[] = [
  "NEW",
  "PROCESSED",
  "ASSIGNED",
  "CLOSED",
];

export const leadStageTriggerClass: Record<LeadStageStatus, string> = {
  NEW: "border-transparent bg-badge-gray-background text-badge-gray-text",
  PROCESSED: "border-transparent bg-badge-sky-background text-badge-sky-text",
  ASSIGNED: "border-transparent bg-badge-warning-background text-badge-warning-text",
  CLOSED: "border-transparent bg-badge-success-background text-badge-success-text",
};

export type LeadResultStatus =
  | "MATCHED"
  | "CREATED"
  | "DUPLICATE"
  | "INVALID"
  | "SPAM"
  | "FAILED";

export const leadResultLabel: Record<LeadResultStatus, string> = {
  MATCHED: "Đã liên kết",
  CREATED: "Đã tạo mới",
  DUPLICATE: "Trùng lặp",
  INVALID: "Không hợp lệ",
  SPAM: "Spam",
  FAILED: "Thất bại",
};

// Duplicate/Invalid/Spam/Failed are all "problem" outcomes, so they share the
// red family — orange → rose → error tracks rising severity.
export const leadResultColor: Record<
  LeadResultStatus,
  "success" | "sky" | "orange" | "rose" | "error"
> = {
  MATCHED: "success",
  CREATED: "sky",
  DUPLICATE: "orange",
  INVALID: "rose",
  SPAM: "error",
  FAILED: "error",
};

export const leadResultOptions: LeadResultStatus[] = [
  "MATCHED",
  "CREATED",
  "DUPLICATE",
  "INVALID",
  "SPAM",
  "FAILED",
];

export function canEditLeadResult(status: LeadStageStatus): boolean {
  return status === "ASSIGNED" || status === "CLOSED";
}

export const LEAD_RESULT_LOCKED_MESSAGE =
  "Chỉ cập nhật được kết quả khi trạng thái là Đã phân công hoặc Đã đóng.";
