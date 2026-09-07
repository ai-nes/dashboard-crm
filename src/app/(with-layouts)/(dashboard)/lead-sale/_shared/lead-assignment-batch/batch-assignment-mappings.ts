import type {
  LeadAssignmentBatchItemStatus,
  LeadAssignmentBatchStatus,
  LeadAssignmentBatchSummary,
} from "@/services/api/lead-sale";

export const batchStatusLabels: Record<LeadAssignmentBatchStatus, string> = {
  draft: "Bản nháp",
  ready: "Đã kiểm tra, chờ phân công",
  running: "Đang phân công",
  completed: "Hoàn tất",
  completed_with_errors: "Hoàn tất, còn hồ sơ cần xử lý",
  cancelled: "Đã hủy",
};

export const batchStatusColors = {
  draft: "gray",
  ready: "primary",
  running: "primary",
  completed: "success",
  completed_with_errors: "warning",
  cancelled: "gray",
} as const;

export const itemStatusLabels: Record<LeadAssignmentBatchItemStatus, string> = {
  pending: "Chờ phân công",
  assigned: "Đã phân công",
  deferred: "Tạm hoãn",
  manual_review: "Cần kiểm tra",
  failed: "Lỗi xử lý",
  skipped: "Đã bỏ qua",
};

export const itemStatusColors = {
  pending: "gray",
  assigned: "success",
  deferred: "warning",
  manual_review: "warning",
  failed: "error",
  skipped: "gray",
} as const;

export const summaryCards = (summary: LeadAssignmentBatchSummary) =>
  [
    {
      key: "total",
      label: "Tổng hồ sơ Lead",
      value: summary.total,
      tone: "default",
    },
    {
      key: "assigned",
      label: "Đã phân công",
      value: summary.assigned,
      tone: "success",
    },
    {
      key: "pending",
      label: "Chờ phân công",
      value: summary.pending,
      tone: "default",
    },
    {
      key: "attention",
      label: "Cần xử lý",
      value: summary.deferred + summary.manualReview + summary.failed,
      tone: "warning",
    },
  ] as const;

export function formatDateTime(value: string | null | undefined): string {
  if (!value || value === "—") return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value);
}
