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
  if (
    summary.skipped +
    summary.manualReview +
    summary.deferred +
    summary.failed
  ) {
    return "Cần lưu ý";
  }
  if (summary.assigned) return "Đã phân công";
  return "Đã xử lý";
}

const reasonLabels: Record<string, string> = {
  // Dữ liệu Lead còn thiếu
  MISSING_PROVINCE:
    "Chưa có tỉnh của Lead nên hệ thống chưa xác định được Team.",
  NOT_PROCESSED: "Lead chưa được kiểm tra dữ liệu đầu vào.",

  // Chưa tìm được Team hoặc người phụ trách
  TEAM_NOT_FOUND_FOR_PROVINCE: "Chưa có Team đang phụ trách tỉnh của Lead.",
  TEAM_NOT_FOUND:
    "Không tìm thấy Team nhận hồ sơ hoặc Team đã ngừng hoạt động.",
  MULTIPLE_INPUT_QUEUES:
    "Team đang có nhiều hàng chờ hoạt động, cần quản trị viên kiểm tra cấu hình.",
  MISSING_INPUT_QUEUE: "Team chưa có hàng chờ hoạt động để nhận hồ sơ.",
  INPUT_QUEUE_TEAM_MISMATCH: "Hàng chờ hiện tại không thuộc Team được chọn.",
  INVALID_CURRENT_OWNERSHIP:
    "Thông tin phân công hiện tại chưa đầy đủ Team hoặc hàng chờ.",
  PROVINCE_MISMATCH: "Tỉnh của Lead không khớp với Team đang phụ trách.",
  TEAM_PROVINCE_MISMATCH: "Team được chọn không phụ trách tỉnh của Lead.",
  TEAM_SCOPE_MISMATCH: "Lead nằm ngoài phạm vi tỉnh của Team.",
  NO_ELIGIBLE_RECIPIENT:
    "Team chưa có Sale/CTV đang hoạt động phù hợp. Kiểm tra nhân sự trong Quản lý Team.",
  STAFF_CAPACITY_NOT_CONFIGURED:
    "Hạn mức cũ đã được bỏ. Chạy lại phân công để cập nhật kết quả.",
  TEAM_NOT_READY: "Team chưa sẵn sàng nhận Lead.",
  NO_ACTIVE_POLICY: "Chưa có chính sách phân công đang hoạt động.",
  OVERLAPPING_POLICY: "Có nhiều chính sách phân công bị chồng lấn.",
  INVALID_TOPOLOGY: "Sơ đồ phân công chưa hợp lệ, cần kiểm tra lại cấu hình.",
  ROUTING_DISABLED: "Tính năng phân công tự động đang tạm tắt.",
  LEAD_ROUTING_DISABLED:
    "Cơ chế phân bổ Lead đang tắt; hãy bật policy trước khi chạy lại.",
  CAMPAIGN_MAPPING_INVALID:
    "Campaign chưa có cấu hình Team/Team Group nhận Lead hợp lệ.",
  CAMPAIGN_TARGET_UNAVAILABLE:
    "Đích phân bổ của Campaign không còn hoạt động hoặc không cùng campus.",
  GROUP_TARGET_UNAVAILABLE:
    "Tỉnh của Lead chưa có Team Sales đang hoạt động để nhận Lead.",
  NO_ROUTING_LAYER:
    "Không có lớp phân bổ nào đang bật và phù hợp với Lead này.",
  CAPACITY_BLOCKED:
    "Lý do hạn mức cũ đã được bỏ. Chạy lại phân công để cập nhật kết quả.",
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

export const routingTierLabels: Record<string, string> = {
  campaign: "Theo Campaign",
  group: "Theo Team Group / tỉnh",
  global: "Chia đều trong campus",
  province: "Theo tỉnh (cấu hình cũ)",
  province_fallback_lead: "Fallback Trưởng nhóm (cấu hình cũ)",
};

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

/** The bare code driving this item's routing failure, however it was stored. */
function assignmentErrorCode(
  item: Pick<AssignmentReasonContext, "reason" | "errorCode">,
): string {
  return (
    item.errorCode ||
    (item.reason && isInternalCode(item.reason) ? item.reason : "")
  );
}

// Codes actually fixed by editing the Lead's own fields (province or by
// running the data-check step again) — the only case where the "Bổ sung
// thông tin định tuyến" edit form in the drawer does anything useful.
const LEAD_DATA_CODES = new Set(["MISSING_PROVINCE", "NOT_PROCESSED"]);

// Codes an admin resolves in Quản lý Team (team scope, queue, or team-lead
// setup) — editing the Lead's own fields cannot fix these.
const TEAM_CONFIG_CODES = new Set([
  "TEAM_NOT_FOUND_FOR_PROVINCE",
  "TEAM_NOT_FOUND",
  "MULTIPLE_INPUT_QUEUES",
  "MISSING_INPUT_QUEUE",
  "INPUT_QUEUE_TEAM_MISMATCH",
  "INVALID_CURRENT_OWNERSHIP",
  "PROVINCE_MISMATCH",
  "TEAM_PROVINCE_MISMATCH",
  "TEAM_SCOPE_MISMATCH",
  "TEAM_NOT_READY",
  "NO_ACTIVE_POLICY",
  "OVERLAPPING_POLICY",
  "INVALID_TOPOLOGY",
  "ROUTING_DISABLED",
  "AMBIGUOUS_POOL",
  "CTV_BATCH_UNAVAILABLE_OR_LEAD_COMPLEX",
]);

// Historical failures from the retired capacity policy.
const RETIRED_CAPACITY_CODES = new Set([
  "STAFF_CAPACITY_NOT_CONFIGURED",
  "CAPACITY_BLOCKED",
]);

// Transient/system codes: the reason text already says what to do (reload,
// retry, open detail) — no Lead field and no admin settings page fixes these.
const SYSTEM_RETRY_CODES = new Set([
  "STALE_ZONE_MAPPING",
  "STALE_OWNERSHIP_REVISION",
  "LEASE_ACTIVE",
  "LEASE_LOST",
  "ROUTING_FAILED",
  "PREVIEW_FAILED",
]);

export type AssignmentActionCategory =
  | "lead-data"
  | "team-config"
  | "system"
  | "unknown";

/**
 * Which kind of fix actually resolves this failure, so the "process" drawer
 * can show a form/link that matches the real cause — a Team
 * problem is never fixed by editing the Lead's own phone/province/school.
 */
export function assignmentActionCategory(
  item: AssignmentReasonContext,
): AssignmentActionCategory {
  const code = assignmentErrorCode(item);
  if (RETIRED_CAPACITY_CODES.has(code)) return "system";
  if (code === "NO_ELIGIBLE_RECIPIENT") {
    // Historical capacity failures should be retried instead of opening settings.
    const reason = item.reason?.trim();
    const isCapacityBlocked = Boolean(
      reason && !isInternalCode(reason) && /giới hạn|capacity/i.test(reason),
    );
    return isCapacityBlocked ? "system" : "team-config";
  }
  if (TEAM_CONFIG_CODES.has(code)) return "team-config";
  if (SYSTEM_RETRY_CODES.has(code)) return "system";
  if (LEAD_DATA_CODES.has(code)) return "lead-data";
  return "unknown";
}

export const assignmentActionLinks: Record<
  "team-config",
  { href: string; label: string }
> = {
  "team-config": { href: "/lead-sale/team-management", label: "Quản lý Team" },
};

function contextualReasonLabel(
  item: AssignmentReasonContext,
  code: string,
): string | null {
  if (code === "INVALID_CURRENT_OWNERSHIP") {
    const missing = [
      !item.team && "Team phụ trách",
      !item.queue && "hàng chờ nhận hồ sơ",
    ].filter(Boolean);
    return missing.length
      ? `Chưa thể phân công vì chưa có ${missing.join(", ")}. Vui lòng bổ sung cấu hình còn thiếu.`
      : "Thông tin Team hoặc hàng chờ không khớp với cấu hình phân công hiện tại.";
  }
  if (code === "TEAM_NOT_FOUND_FOR_PROVINCE") {
    return item.province
      ? `Chưa có Team nào được cấu hình phụ trách tỉnh ${item.province}. Vui lòng gán tỉnh này cho một Team đang hoạt động.`
      : reasonLabels.MISSING_PROVINCE;
  }
  if (
    RETIRED_CAPACITY_CODES.has(code) ||
    (code === "NO_ELIGIBLE_RECIPIENT" &&
      /giới hạn|capacity/i.test(item.reason ?? ""))
  ) {
    return "Lý do này thuộc hạn mức cũ đã được bỏ. Chạy lại phân công để cập nhật kết quả.";
  }
  if (code === "NO_ELIGIBLE_RECIPIENT") {
    const backendReason = item.reason?.trim();
    const nextStep =
      "Vào Quản lý Team để bổ sung Sale/CTV hoặc Trưởng nhóm đang hoạt động.";
    return backendReason && !isInternalCode(backendReason)
      ? `${backendReason} ${nextStep}`
      : nextStep;
  }
  return null;
}

export function assignmentReasonLabel(item: AssignmentReasonContext): string {
  const code = assignmentErrorCode(item);
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
  return unknownReasonLabel;
}
