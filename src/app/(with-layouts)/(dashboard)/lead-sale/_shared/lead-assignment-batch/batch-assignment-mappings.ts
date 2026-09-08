import type {
  LeadAssignmentBatchItem,
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

export function assignmentReasonLabel(item: LeadAssignmentBatchItem): string {
  const labels: Record<string, string> = {
    MISSING_PROVINCE:
      "Chưa có tỉnh của Lead nên hệ thống chưa xác định được Team.",
    MISSING_CAMPUS: "Chưa có trường/campus của Lead để kiểm tra dữ liệu.",
    TEAM_NOT_FOUND_FOR_PROVINCE:
      "Chưa có Team đang phụ trách tỉnh của Lead.",
    INVALID_CURRENT_OWNERSHIP:
      "Thông tin phân công hiện tại chưa đầy đủ Team, hàng chờ hoặc campus.",
    PROVINCE_MISMATCH: "Tỉnh của Lead không khớp với Team đang phụ trách.",
    TEAM_PROVINCE_MISMATCH: "Team được chọn không phụ trách tỉnh của Lead.",
    TEAM_SCOPE_MISMATCH: "Lead nằm ngoài phạm vi tỉnh của Team.",
    NO_ELIGIBLE_RECIPIENT:
      "Team đã xác định nhưng chưa có Sale/CTV đủ điều kiện nhận Lead.",
    TEAM_NOT_READY: "Team chưa sẵn sàng nhận Lead.",
    NOT_PROCESSED: "Lead chưa được kiểm tra dữ liệu đầu vào.",
    INVALID: "Hồ sơ không hợp lệ nên đã đóng, không tiếp tục phân công.",
  };

  if (item.errorCode && labels[item.errorCode]) return labels[item.errorCode];
  if (item.reason && !item.reason.includes("INVALID_CURRENT_OWNERSHIP")) {
    return item.reason;
  }
  if (!item.province) {
    return labels.MISSING_PROVINCE;
  }
  if (!item.branch) {
    return labels.MISSING_CAMPUS;
  }
  return "Hệ thống chưa xác định được lý do; cần kiểm tra lại cấu hình Team.";
}
