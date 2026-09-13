import type { ActivityLogEntry } from "@/services/api/activity-log";
import { formatAuditMetadataKey } from "@/utils/format-audit-metadata";

const ACTION_LABELS: Record<string, string> = {
  created: "Đã tạo",
  updated: "Đã cập nhật",
  deleted: "Đã xóa",
  viewed: "Đã xem",
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  login_recorded: "Đăng nhập hệ thống",
  logout_recorded: "Đăng xuất hệ thống",
  resolution_changed: "Đã thay đổi kết quả",
  processing_status_changed: "Đã cập nhật trạng thái xử lý",
  field_changed: "Đã thay đổi thông tin",
  team_changed: "Đã thay đổi team",
  role_changed: "Đã thay đổi quyền",
  permission_changed: "Đã cập nhật phân quyền",
  segment_created: "Đã tạo segment",
  segment_updated: "Đã cập nhật segment",
  segment_deleted: "Đã xóa segment",
};

const DOCTYPE_LABELS: Record<string, string> = {
  "CRM Lead": "Lead CRM",
  "CRM Student": "Học sinh",
  "CRM User": "Người dùng CRM",
  User: "Người dùng",
  Segment: "Segment",
  Campaign: "Chiến dịch",
};

function humanizeToken(value: string | null | undefined): string {
  if (!value) return "Hoạt động hệ thống";

  return formatAuditMetadataKey(value)
    .replace(/\bcrm\b/gi, "CRM")
    .replace(/\bapi\b/gi, "API");
}

export function getActivityTitle(log: ActivityLogEntry): string {
  return (
    EVENT_TYPE_LABELS[log.eventType] ??
    ACTION_LABELS[log.action] ??
    humanizeToken(log.eventType || log.action || log.category)
  );
}

export function getActionLabel(action: string): string {
  return ACTION_LABELS[action] ?? humanizeToken(action);
}

export function getEventTechnicalLabel(log: ActivityLogEntry): string {
  return log.eventType || log.category || log.action;
}

export function getDoctypeLabel(doctype: string): string {
  return DOCTYPE_LABELS[doctype] ?? humanizeToken(doctype);
}

export function getFieldLabel(log: ActivityLogEntry): string {
  return (
    log.fieldLabel || (log.fieldname ? humanizeToken(log.fieldname) : "Kết quả")
  );
}

export function displayAuditValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "Không có";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "Dữ liệu không thể hiển thị";
    }
  }

  return String(value);
}

export function getInitials(name: string | null | undefined): string {
  const normalizedName = name?.trim();
  if (!normalizedName) return "?";

  const parts = normalizedName.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
