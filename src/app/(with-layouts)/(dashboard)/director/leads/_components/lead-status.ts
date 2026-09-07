import type {
  LeadProcessStatus,
  LeadResolution,
  LeadResolutionFilter,
} from "@/services/api/lead-sale";

export type LeadStageStatus = LeadProcessStatus;

export const leadStageStatusLabel: Record<LeadStageStatus, string> = {
  NEW: "Mới",
  PROCESSING: "Đang xử lý",
  PROCESSED: "Đã xử lý",
  ASSIGNED: "Đã phân công",
  CLOSED: "Đã đóng",
};

export const leadStageStatusColor: Record<
  LeadStageStatus,
  "gray" | "sky" | "warning" | "success"
> = {
  NEW: "gray",
  PROCESSING: "sky",
  PROCESSED: "sky",
  ASSIGNED: "warning",
  CLOSED: "success",
};

export const leadStageStatusOptions: LeadStageStatus[] = [
  "NEW",
  "PROCESSING",
  "PROCESSED",
  "ASSIGNED",
  "CLOSED",
];

export const leadStageTriggerClass: Record<LeadStageStatus, string> = {
  NEW: "border-transparent bg-badge-gray-background text-badge-gray-text",
  PROCESSING: "border-transparent bg-badge-sky-background text-badge-sky-text",
  PROCESSED: "border-transparent bg-badge-sky-background text-badge-sky-text",
  ASSIGNED:
    "border-transparent bg-badge-warning-background text-badge-warning-text",
  CLOSED:
    "border-transparent bg-badge-success-background text-badge-success-text",
};

export function normalizeLeadStageStatus(
  value: unknown,
): LeadStageStatus | null {
  const candidate = typeof value === "string" ? value.toUpperCase() : "";
  return leadStageStatusOptions.includes(candidate as LeadStageStatus)
    ? (candidate as LeadStageStatus)
    : null;
}

export type LeadResultStatus = LeadResolution;
export type LeadResultFilter = LeadResolutionFilter;

export const leadResultLabel: Record<LeadResultStatus, string> = {
  MATCHED: "Đã liên kết",
  CREATED: "Sẽ tạo khi chuyển đổi",
  DUPLICATE: "Trùng lặp",
  INVALID: "Không hợp lệ",
  SPAM: "Spam",
  FAILED: "Thất bại",
};

export const leadResultFilterLabel: Record<LeadResultFilter, string> = {
  PENDING: "Chưa có kết quả",
  ...leadResultLabel,
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

export const leadResultFilterOptions: LeadResultFilter[] = [
  "PENDING",
  ...leadResultOptions,
];

export function canEditLeadResult(status: LeadStageStatus | null): boolean {
  return status === "NEW";
}

export const LEAD_RESULT_LOCKED_MESSAGE =
  "Chỉ chọn kết quả khi Lead đang ở trạng thái Mới để bắt đầu xử lý.";
