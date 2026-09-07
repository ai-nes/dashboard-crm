import type { LeadResolution } from "@/services/api/lead-sale";

export type LeadStatusCode =
  | "New"
  | "Working"
  | "Contacted"
  | "Nurturing"
  | "Qualified"
  | "Unqualified"
  | "Converted"
  | "Lost";

export const leadStatusOptions: LeadStatusCode[] = [
  "New",
  "Working",
  "Contacted",
  "Nurturing",
  "Qualified",
  "Unqualified",
  "Converted",
  "Lost",
];

export const leadStatusLabel: Record<LeadStatusCode, string> = {
  New: "Mới",
  Working: "Đang xử lý",
  Contacted: "Đã liên hệ",
  Nurturing: "Đang nuôi dưỡng",
  Qualified: "Đủ điều kiện",
  Unqualified: "Không đủ điều kiện",
  Converted: "Đã chuyển đổi",
  Lost: "Đã mất",
};

export const leadStatusTriggerClass: Record<LeadStatusCode, string> = {
  New: "border-transparent bg-badge-gray-background text-badge-gray-text",
  Working: "border-transparent bg-badge-sky-background text-badge-sky-text",
  Contacted: "border-transparent bg-badge-primary-background text-badge-primary-text",
  Nurturing: "border-transparent bg-badge-warning-background text-badge-warning-text",
  Qualified: "border-transparent bg-badge-success-background text-badge-success-text",
  Unqualified: "border-transparent bg-badge-rose-background text-badge-rose-text",
  Converted: "border-transparent bg-badge-success-background text-badge-success-text",
  Lost: "border-transparent bg-badge-error-background text-badge-error-text",
};

export function normalizeLeadStatus(value: unknown): LeadStatusCode | null {
  const candidate = typeof value === "string" ? value.trim().toLowerCase() : "";
  return (
    leadStatusOptions.find(
      (status) =>
        status.toLowerCase() === candidate ||
        leadStatusLabel[status].toLowerCase() === candidate,
    ) ?? null
  );
}

export type LeadStageStatus =
  | "NEW"
  | "PROCESSING"
  | "PROCESSED"
  | "ASSIGNED"
  | "CLOSED";

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
  ASSIGNED: "border-transparent bg-badge-warning-background text-badge-warning-text",
  CLOSED: "border-transparent bg-badge-success-background text-badge-success-text",
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

export function canEditLeadResult(status: LeadStageStatus | null): boolean {
  return status === "ASSIGNED" || status === "CLOSED";
}

export const LEAD_RESULT_LOCKED_MESSAGE =
  "Chỉ cập nhật được kết quả khi trạng thái là Đã phân công hoặc Đã đóng.";
