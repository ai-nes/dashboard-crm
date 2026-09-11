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
  completed_with_errors: "Hoàn tất, còn hồ sơ cần lưu ý",
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
      label: "Cần lưu ý",
      value:
        summary.skipped +
        summary.deferred +
        summary.manualReview +
        summary.failed,
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

export function formatDate(value: string | null | undefined): string {
  if (!value || value === "—") return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
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
  if (summary.skipped + summary.manualReview + summary.deferred + summary.failed) {
    return "Cần lưu ý";
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
  TEAM_NOT_FOUND: "Không tìm thấy Team nhận hồ sơ hoặc Team đã ngừng hoạt động.",
  MULTIPLE_INPUT_QUEUES:
    "Team đang có nhiều hàng chờ hoạt động, cần quản trị viên kiểm tra cấu hình.",
  MISSING_INPUT_QUEUE: "Team chưa có hàng chờ hoạt động để nhận hồ sơ.",
  INPUT_QUEUE_TEAM_MISMATCH: "Hàng chờ hiện tại không thuộc Team được chọn.",
  INVALID_CURRENT_OWNERSHIP:
    "Thông tin phân công hiện tại chưa đầy đủ Team, hàng chờ hoặc campus.",
  PROVINCE_MISMATCH: "Tỉnh của Lead không khớp với Team đang phụ trách.",
  TEAM_PROVINCE_MISMATCH: "Team được chọn không phụ trách tỉnh của Lead.",
  TEAM_SCOPE_MISMATCH: "Lead nằm ngoài phạm vi tỉnh của Team.",
  NO_ELIGIBLE_RECIPIENT:
    "Team đã xác định nhưng chưa có Sale/CTV đủ điều kiện nhận Lead.",
  TEAM_NOT_READY: "Team chưa sẵn sàng nhận Lead.",
  NO_ACTIVE_POLICY: "Chưa có chính sách phân công đang hoạt động.",
  OVERLAPPING_POLICY: "Có nhiều chính sách phân công bị chồng lấn.",
  INVALID_TOPOLOGY: "Sơ đồ phân công chưa hợp lệ, cần kiểm tra lại cấu hình.",
  ROUTING_DISABLED: "Tính năng phân công tự động đang tạm tắt.",
  CAPACITY_BLOCKED: "Nhân sự phù hợp đã hết sức chứa nhận hồ sơ.",
  AMBIGUOUS_POOL: "Có nhiều hàng chờ phù hợp, chưa thể chọn chính xác.",
  CTV_BATCH_UNAVAILABLE_OR_LEAD_COMPLEX:
    "Hồ sơ chưa phù hợp để phân công theo nhóm CTV.",
  STALE_ZONE_MAPPING: "Cấu hình khu vực đã thay đổi, cần chạy phân công lại.",
  STALE_OWNERSHIP_REVISION:
    "Thông tin người phụ trách đã thay đổi, cần tải lại và thử lại.",
  LEASE_ACTIVE: "Hồ sơ đang được một tiến trình khác xử lý.",
  LEASE_LOST: "Phiên xử lý đã hết hạn, cần thực hiện lại.",
  ROUTING_FAILED: "Hệ thống chưa hoàn tất được bước tìm người phụ trách.",
  PREVIEW_FAILED: "Không thể kiểm tra trước hồ sơ, cần mở chi tiết để xử lý.",

  // Trạng thái hồ sơ
  INVALID: "Hồ sơ không hợp lệ nên đã đóng, không tiếp tục phân công.",
  SPAM: "Hồ sơ bị đánh dấu là rác nên đã đóng.",
  DUPLICATE: "Hồ sơ trùng với một Lead khác nên đã đóng.",
  FAILED: "Hồ sơ chưa qua được bước kiểm tra dữ liệu.",
  CLOSED: "Hồ sơ đang đóng nên chưa thể phân công.",
  PENDING: "Hồ sơ chưa có kết luận kiểm tra dữ liệu.",
  INVALID_PROCESSING_STATUS: "Trạng thái hồ sơ chưa phù hợp để phân công.",
  IDENTIFIER_GATE_FAILED:
    "Hồ sơ chưa vượt qua bước kiểm tra thông tin bắt buộc.",
  PROCESSING_FAILED: "Không thể hoàn tất bước kiểm tra hồ sơ.",
  OWNER_REQUIRED: "Chưa có người phụ trách để hoàn tất phân công.",
  OUT_OF_SCOPE: "Hồ sơ nằm ngoài phạm vi dữ liệu được phép xử lý.",
  NOT_POOL_OWNED: "Hồ sơ không thuộc hàng chờ đang được xử lý.",
  STUDENT_NOT_FOUND: "Không tìm thấy hồ sơ học sinh tương ứng.",
  NOT_FOUND: "Không tìm thấy hồ sơ cần xử lý.",

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
  "Hồ sơ chưa thể xử lý. Vui lòng kiểm tra dữ liệu và cấu hình phân công.";

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

type AssignmentReasonContext = Pick<
  LeadAssignmentBatchItem,
  "reason" | "errorCode" | "province" | "team" | "queue" | "branch"
>;

function contextualReasonLabel(
  item: AssignmentReasonContext,
  code: string,
): string | null {
  if (code === "INVALID_CURRENT_OWNERSHIP") {
    const missing = [
      !item.team && "Team phụ trách",
      !item.queue && "hàng chờ nhận hồ sơ",
      !item.branch && "cơ sở/campus",
    ].filter(Boolean);
    return missing.length
      ? `Chưa thể phân công vì chưa có ${missing.join(", ")}. Vui lòng bổ sung cấu hình còn thiếu.`
      : "Thông tin Team, hàng chờ hoặc cơ sở không khớp với cấu hình phân công hiện tại.";
  }
  if (code === "TEAM_NOT_FOUND_FOR_PROVINCE") {
    return item.province
      ? `Chưa có Team nào được cấu hình phụ trách tỉnh ${item.province}. Vui lòng gán tỉnh này cho một Team đang hoạt động.`
      : reasonLabels.MISSING_PROVINCE;
  }
  if (code === "NO_ELIGIBLE_RECIPIENT") {
    return item.team
      ? `Team ${item.team} đã được tìm thấy nhưng chưa có Sale/CTV đang hoạt động và còn chỗ nhận hồ sơ.`
      : reasonLabels.NO_ELIGIBLE_RECIPIENT;
  }
  return null;
}

export function assignmentReasonLabel(
  item: AssignmentReasonContext,
): string {
  const code = item.errorCode || (item.reason && isInternalCode(item.reason) ? item.reason : "");
  const contextualReason = contextualReasonLabel(item, code);
  if (contextualReason) return contextualReason;

  // A specific reason from the backend (e.g. "Đã đóng hồ sơ vì: Thiếu số điện
  // thoại.") must win over a generic status label like reasonLabels.INVALID —
  // otherwise every closed Lead shows the same catch-all text regardless of
  // why it was actually closed.
  const reason = item.reason ? humanizeReason(item.reason) : "";
  if (reason) return reason;

  if (item.errorCode && reasonLabels[item.errorCode]) {
    return reasonLabels[item.errorCode];
  }

  // Never infer a data problem from an unknown backend code. Keep the
  // internal identifier out of the UI and give the operator a safe next step.
  if (item.errorCode || item.reason) return unknownReasonLabel;

  if (!item.province) return reasonLabels.MISSING_PROVINCE;
  if (!item.branch) return reasonLabels.MISSING_CAMPUS;
  return unknownReasonLabel;
}
