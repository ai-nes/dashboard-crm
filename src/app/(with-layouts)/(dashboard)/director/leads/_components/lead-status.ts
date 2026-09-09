import type {
  LeadResolution,
  LeadResolutionFilter,
} from "@/services/api/lead-sale";

export type LeadStageStatus =
  | "NEW"
  | "PROCESSED"
  | "ASSIGNED"
  | "CLOSED";

export const leadStageStatusLabel: Record<LeadStageStatus, string> = {
  NEW: "Mới",
  PROCESSED: "Đã xử lý",
  ASSIGNED: "Đã phân công",
  CLOSED: "Đã đóng",
};

export const leadStageStatusColor: Record<
  LeadStageStatus,
  "primary" | "sky" | "violet" | "success"
> = {
  NEW: "primary",
  PROCESSED: "sky",
  ASSIGNED: "violet",
  CLOSED: "success",
};

export const leadStageStatusOptions: LeadStageStatus[] = [
  "NEW",
  "PROCESSED",
  "ASSIGNED",
  "CLOSED",
];

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
  PENDING: "Chưa có kết quả",
  MATCHED: "Đã liên kết",
  CREATED: "Sẽ tạo khi chuyển đổi",
  DUPLICATE: "Trùng lặp",
  INVALID: "Không hợp lệ",
  SPAM: "Spam",
  FAILED: "Thất bại",
};

export const leadResultFilterLabel: Record<LeadResultFilter, string> = {
  ...leadResultLabel,
};

// Duplicate/Invalid/Spam/Failed are all "problem" outcomes, so they share the
// red family — orange → rose → error tracks rising severity.
export const leadResultColor: Record<
  LeadResultStatus,
  "gray" | "success" | "sky" | "orange" | "rose" | "error"
> = {
  PENDING: "gray",
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
