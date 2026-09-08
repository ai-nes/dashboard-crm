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

export function workflowResultLabel(
  summary: LeadAssignmentBatchSummary | null | undefined,
  hasData: boolean,
): string {
  if (!hasData || !summary?.total) return "Chưa có dữ liệu";
  if (summary.pending) return "Chờ phân công";
  if (summary.manualReview + summary.deferred + summary.failed) {
    return "Cần xử lý";
  }
  if (summary.assigned) return "Đã phân công";
  return "Đã xử lý";
}

const reasonLabels: Record<string, string> = {
  // Dữ liệu Lead còn thiếu
  MISSING_PROVINCE:
    "Chưa có tỉnh của Lead nên hệ thống chưa xác định được Team.",
  MISSING_CAMPUS: "Chưa có trường/campus của Lead để kiểm tra dữ liệu.",
  NOT_PROCESSED: "Lead chưa được kiểm tra dữ liệu đầu vào.",

  // Chưa tìm được Team hoặc người phụ trách
  TEAM_NOT_FOUND_FOR_PROVINCE: "Chưa có Team đang phụ trách tỉnh của Lead.",
  INVALID_CURRENT_OWNERSHIP:
    "Thông tin phân công hiện tại chưa đầy đủ Team, hàng chờ hoặc campus.",
  PROVINCE_MISMATCH: "Tỉnh của Lead không khớp với Team đang phụ trách.",
  TEAM_PROVINCE_MISMATCH: "Team được chọn không phụ trách tỉnh của Lead.",
  TEAM_SCOPE_MISMATCH: "Lead nằm ngoài phạm vi tỉnh của Team.",
  NO_ELIGIBLE_RECIPIENT:
    "Team đã xác định nhưng chưa có Sale/CTV đủ điều kiện nhận Lead.",
  TEAM_NOT_READY: "Team chưa sẵn sàng nhận Lead.",
  ROUTING_FAILED: "Hệ thống chưa hoàn tất được bước tìm người phụ trách.",

  // Trạng thái hồ sơ
  INVALID: "Hồ sơ không hợp lệ nên đã đóng, không tiếp tục phân công.",
  SPAM: "Hồ sơ bị đánh dấu là rác nên đã đóng.",
  DUPLICATE: "Hồ sơ trùng với một Lead khác nên đã đóng.",
  FAILED: "Hồ sơ chưa qua được bước kiểm tra dữ liệu.",
  CLOSED: "Hồ sơ đang đóng nên chưa thể phân công.",
  PENDING: "Hồ sơ chưa có kết luận kiểm tra dữ liệu.",
  INVALID_PROCESSING_STATUS: "Trạng thái hồ sơ chưa phù hợp để phân công.",

  // Kết quả trong đợt phân công
  ready: "Đã đủ điều kiện, sẵn sàng phân công.",
  ASSIGNED: "Đã phân công.",
  DEFERRED: "Đã đưa vào hàng chờ, sẽ phân công sau.",
  ALREADY_ASSIGNED: "Lead đã có người phụ trách từ trước.",
  ALREADY_CONVERTED: "Lead đã chuyển thành hồ sơ sinh viên.",
  MATCHED: "Đã liên kết với hồ sơ có sẵn.",
  CREATED: "Đã tạo hồ sơ mới từ Lead.",
};

const unknownReasonLabel =
  "Hệ thống chưa xác định được lý do; cần kiểm tra lại cấu hình Team.";

/** True for a bare internal token such as MISSING_PROVINCE or PROVINCE:HCM. */
function isInternalCode(value: string): boolean {
  return /^[\w:.-]+$/.test(value);
}

/**
 * Render a stored reason as text a non-technical operator can read.
 *
 * The backend writes a reason as raw code as often as prose, and chains the
 * steps of one decision with an arrow. Each step is translated when a label
 * exists and dropped when it is an untranslated code, so no internal
 * identifier reaches the screen.
 */
function humanizeReason(reason: string): string {
  return reason
    .split("→")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => reasonLabels[part] ?? (isInternalCode(part) ? "" : part))
    .filter(Boolean)
    .join(" → ");
}

export function assignmentReasonLabel(item: LeadAssignmentBatchItem): string {
  if (item.errorCode && reasonLabels[item.errorCode]) {
    return reasonLabels[item.errorCode];
  }

  const reason = item.reason ? humanizeReason(item.reason) : "";
  if (reason) return reason;

  if (!item.province) return reasonLabels.MISSING_PROVINCE;
  if (!item.branch) return reasonLabels.MISSING_CAMPUS;
  return unknownReasonLabel;
}
