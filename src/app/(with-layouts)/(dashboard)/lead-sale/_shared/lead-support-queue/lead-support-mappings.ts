import type {
  LeadSupportItem,
  LeadSupportOutcome,
  LeadSupportReason,
} from "@/services/api/lead-sale";

export type SupportFilter = "all" | LeadSupportReason;

export const supportReasonLabels: Record<LeadSupportReason, string> = {
  INVALID: "Không hợp lệ",
  MISSING_PROVINCE: "Thiếu tỉnh/thành",
  MISSING_CAMPUS: "Thiếu cơ sở",
  CAMPUS_MISMATCH: "Cơ sở lệch chiến dịch",
};

export const supportReasonColors: Record<
  LeadSupportReason,
  "primary" | "warning" | "error" | "gray"
> = {
  INVALID: "error",
  MISSING_PROVINCE: "warning",
  MISSING_CAMPUS: "warning",
  CAMPUS_MISMATCH: "warning",
};

export const supportFilters: readonly SupportFilter[] = [
  "all",
  "MISSING_PROVINCE",
  "MISSING_CAMPUS",
  "CAMPUS_MISMATCH",
  "INVALID",
];

const INVALID_ISSUE_LABELS: Record<string, string> = {
  "Missing student name": "thiếu họ tên",
  "Missing or invalid phone number":
    "số điện thoại thiếu hoặc sai (cần 10 số, bắt đầu bằng 0)",
  "Missing province": "thiếu tỉnh/thành",
};

export function translateIssues(issues: readonly string[]) {
  return issues.map((issue) => INVALID_ISSUE_LABELS[issue] ?? issue).join("; ");
}

/** What the Sale should do next, in plain words. */
export function supportReasonDetail(item: LeadSupportItem): string {
  switch (item.reason) {
    case "INVALID": {
      const issues = Object.keys(INVALID_ISSUE_LABELS).filter((issue) =>
        item.resolutionReason.includes(issue),
      );
      return issues.length
        ? `Lead bị đóng vì ${translateIssues(issues)}. Bổ sung để mở lại.`
        : "Lead bị đóng vì dữ liệu không hợp lệ. Bổ sung để mở lại.";
    }
    case "MISSING_PROVINCE":
      return "Lead chưa có tỉnh/thành nên chưa tìm được Team phụ trách.";
    case "MISSING_CAMPUS":
      return "Lead chưa có cơ sở nên chưa tìm được Team phụ trách.";
    case "CAMPUS_MISMATCH":
      return `Lead chọn cơ sở ${item.campus?.name ?? "khác"} nhưng thuộc chiến dịch của ${item.campaign?.campusName || "cơ sở khác"}. Xác nhận lại với học sinh.`;
  }
}

export const supportOutcomeMessages: Record<LeadSupportOutcome, string> = {
  assigned: "Đã bổ sung và hệ thống đã phân công Lead.",
  waiting_assignment:
    "Đã lưu. Lead vẫn còn thiếu thông tin để phân công, vui lòng kiểm tra lại.",
  needs_configuration:
    "Đã bổ sung đủ dữ liệu. Lead đang chờ phân công (tự động hoặc Lead Sale cấu hình Team cho tỉnh này).",
  still_invalid: "Lead vẫn chưa hợp lệ",
  closed_duplicate:
    "Lead trùng với một Lead khác nên đã được đóng. Lead Sale sẽ kiểm tra.",
};
