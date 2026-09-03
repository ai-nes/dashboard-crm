import { ArrowRight, FileText } from "@tailgrids/icons";
import { Badge } from "@/components/tailgrids/core/badge";
import type { StudentAuditLog } from "@/services/api/student-audit";
import { formatDateTime } from "@/utils/format-date";

import { parseStudentActivityDate } from "./student-activity-utils";

export type StudentAuditTone = "success" | "primary" | "warning" | "error";

export function getStudentAuditActor(event: StudentAuditLog): string {
  return event.ownerFullName || event.owner || "Hệ thống";
}

export function getStudentAuditActionLabel(event: StudentAuditLog): string {
  if (event.action === "created") return "Tạo hồ sơ học sinh";
  if (event.action === "deleted") return "Xóa hồ sơ học sinh";

  const field = event.fieldLabel || event.fieldname;
  return field ? `Cập nhật ${field}` : "Cập nhật hồ sơ học sinh";
}

export function getStudentAuditActivityDescription(
  event: StudentAuditLog,
): string {
  if (event.action === "created") return "đã tạo hồ sơ học sinh";
  if (event.action === "deleted") {
    return event.restored
      ? "đã xóa rồi khôi phục hồ sơ học sinh"
      : "đã xóa hồ sơ học sinh";
  }

  const field = event.fieldLabel || event.fieldname;
  if (event.changeType === "added") {
    return `đã thêm ${field || "dữ liệu hồ sơ"}`;
  }
  if (event.changeType === "removed") {
    return `đã xóa ${field || "dữ liệu hồ sơ"}`;
  }
  return `đã cập nhật ${field || "hồ sơ học sinh"}`;
}

export function getStudentAuditStatus(event: StudentAuditLog): string {
  if (event.action === "created") return "Đã tạo";
  if (event.action === "deleted") {
    return event.restored ? "Đã khôi phục" : "Đã xóa";
  }

  if (event.changeType === "added") return "Đã thêm";
  if (event.changeType === "removed") return "Đã xóa trường";
  return "Đã cập nhật";
}

export function getStudentAuditTone(event: StudentAuditLog): StudentAuditTone {
  if (
    event.action === "created" ||
    (event.action === "deleted" && event.restored)
  ) {
    return "success";
  }
  if (event.action === "deleted") return "error";
  if (event.changeType === "removed") return "warning";
  return "primary";
}

export function formatStudentAuditValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string") return value;

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function formatStudentAuditRelativeTime(value: string): string {
  const occurredAt = parseStudentActivityDate(value);
  if (occurredAt.getTime() === 0) return formatDateTime(value);

  const difference = Date.now() - occurredAt.getTime();
  if (difference < 0) return "Sắp tới";

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const days = Math.floor(difference / day);

  if (difference < minute) return "Vừa xong";
  if (difference < hour) return `${Math.floor(difference / minute)} phút trước`;
  if (difference < day) return `${Math.floor(difference / hour)} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  if (days < 30) return `${Math.floor(days / 7)} tuần trước`;
  if (days < 365) return `${Math.floor(days / 30)} tháng trước`;
  return `${Math.floor(days / 365)} năm trước`;
}

interface StudentAuditEventDetailsProps {
  event: StudentAuditLog;
  compact?: boolean;
  showSummary?: boolean;
}

export function StudentAuditEventDetails({
  event,
  compact = false,
  showSummary = true,
}: StudentAuditEventDetailsProps) {
  const isFieldChange = event.action === "updated";

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      {showSummary && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-text-primary">
            {getStudentAuditActionLabel(event)}
          </p>
          <Badge color={getStudentAuditTone(event)} size="sm">
            {getStudentAuditStatus(event)}
          </Badge>
        </div>
      )}

      {isFieldChange && (
        <div className="space-y-2">
          {event.fieldLabel && (
            <p className="text-xs text-text-tertiary">
              Trường dữ liệu:{" "}
              <span className="font-medium text-text-primary">
                {event.fieldLabel}
              </span>
              {event.fieldname && event.fieldname !== event.fieldLabel && (
                <span className="ml-1 text-text-tertiary">({event.fieldname})</span>
              )}
            </p>
          )}

          {!compact && (
            <div className="flex flex-col gap-2 rounded-lg border border-card-border/60 bg-background-gray-secondary/20 p-2.5 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1 space-y-1 rounded-md border border-card-border/40 bg-card-background p-2.5">
                <span className="text-[11px] font-medium text-text-tertiary">Giá trị trước</span>
                <p className="break-words text-xs text-text-secondary line-through decoration-error-500/50">
                  {formatStudentAuditValue(event.oldValue)}
                </p>
              </div>
              <div className="flex shrink-0 items-center justify-center text-text-tertiary">
                <ArrowRight size={14} className="rotate-90 sm:rotate-0" />
              </div>
              <div className="min-w-0 flex-1 space-y-1 rounded-md border border-success-500/20 bg-badge-success-background/30 p-2.5">
                <span className="text-[11px] font-medium text-success-600">Giá trị mới</span>
                <p className="break-words text-xs font-semibold text-text-primary">
                  {formatStudentAuditValue(event.newValue)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {!compact && (
        <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-text-tertiary">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-card-border/50 bg-background-gray-secondary/40 px-2 py-1 text-text-secondary">
            <FileText size={12} className="text-text-tertiary" />
            <span>Nguồn: {event.source || "Tài liệu"}</span>
            {event.sourceName && (
              <span className="font-mono font-medium text-text-primary">
                · {event.sourceName}
              </span>
            )}
          </span>
          {event.doctype && (
            <span className="rounded-md border border-card-border/40 bg-background-gray-secondary/30 px-2 py-1 text-text-secondary">
              Đối tượng: <span className="font-medium text-text-primary">{event.doctype}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
