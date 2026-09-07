import { ArrowRight, FileText } from "@tailgrids/icons";
import { Badge } from "@/components/tailgrids/core/badge";
import type { StudentAuditLog } from "@/services/api/student-audit";
import { formatDateTime } from "@/utils/format-date";
import { formatAuditMetadataKey } from "@/utils/format-audit-metadata";

import { parseStudentActivityDate } from "./student-activity-utils";

export type StudentAuditTone = "success" | "primary" | "warning" | "error";

export function getStudentAuditActor(event: StudentAuditLog): string {
  return event.ownerFullName || event.owner || "Hệ thống";
}

export function getStudentAuditSourceLabel(source?: string | null): string {
  switch (source?.toLocaleLowerCase("en-US")) {
    case "document":
      return "Hồ sơ học sinh";
    case "version":
      return "Lịch sử cập nhật";
    case "deleted document":
      return "Hồ sơ đã xóa";
    default:
      return source || "Hồ sơ tuyển sinh";
  }
}

export function getStudentAuditDoctypeLabel(doctype?: string | null): string {
  return doctype === "CRM Lead" ? "Hồ sơ học sinh" : doctype || "Hồ sơ";
}

export function getStudentAuditActionLabel(event: StudentAuditLog): string {
  if (event.action === "created") return "Tạo hồ sơ học sinh";
  if (event.action === "deleted") return "Xóa hồ sơ học sinh";
  if (event.eventType === "status_initialized") {
    return "Gán tình trạng ban đầu";
  }

  if (event.category === "status") return "Cập nhật tình trạng học sinh";
  if (event.category === "lifecycle") return "Cập nhật vòng đời hồ sơ";
  if (event.category === "assignment") return "Thay đổi phân công";
  if (event.category === "processing") return "Cập nhật xử lý Lead";
  if (event.category === "conversion") return "Cập nhật chuyển đổi";
  if (event.category === "outcome") return "Ghi nhận kết quả";

  const field = event.fieldLabel;
  return field ? `Cập nhật ${field}` : "Cập nhật hồ sơ học sinh";
}

export function getStudentAuditCategoryLabel(
  category?: StudentAuditLog["category"],
): string | null {
  switch (category) {
    case "status":
      return "Tình trạng";
    case "lifecycle":
      return "Vòng đời";
    case "assignment":
      return "Phân công";
    case "processing":
      return "Xử lý Lead";
    case "conversion":
      return "Chuyển đổi";
    case "outcome":
      return "Kết quả";
    default:
      return null;
  }
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

  const field = event.fieldLabel;
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
  if (event.eventType === "status_initialized") return "Đã gán ban đầu";

  if (event.category === "status") return "Đã đổi tình trạng";
  if (event.category === "lifecycle") return "Đã đổi vòng đời";
  if (event.category === "assignment") return "Đã đổi phân công";
  if (event.category === "processing") return "Đã cập nhật xử lý";
  if (event.category === "conversion") return "Đã cập nhật chuyển đổi";
  if (event.category === "outcome") return "Đã ghi nhận kết quả";

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
  if (event.category === "outcome") return "success";
  if (event.category === "assignment" || event.category === "processing") {
    return "warning";
  }
  if (event.changeType === "removed") return "warning";
  return "primary";
}

export function formatStudentAuditValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string") {
    return isStudentAuditIdentifier(value) ? "—" : value;
  }

  try {
    return JSON.stringify(redactStudentAuditIdentifiers(value));
  } catch {
    return String(value);
  }
}

function isStudentAuditIdentifier(value: string): boolean {
  const normalizedValue = value.trim();

  return (
    /^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i.test(
      normalizedValue,
    ) || /^(?=.*[a-z])(?=.*\d)[a-z\d]{8,}$/.test(normalizedValue)
  );
}

function redactStudentAuditIdentifiers(value: unknown): unknown {
  if (typeof value === "string") {
    return isStudentAuditIdentifier(value) ? "—" : value;
  }

  if (Array.isArray(value)) {
    return value.map(redactStudentAuditIdentifiers);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !isStudentAuditIdentifierKey(key))
        .map(([key, nestedValue]) => [
          key,
          redactStudentAuditIdentifiers(nestedValue),
        ]),
    );
  }

  return value;
}

function isStudentAuditIdentifierKey(key: string): boolean {
  return /(^id$|_id$|Id$|ID$)/.test(key);
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
            </p>
          )}

          {!compact && (
            <div className="flex flex-col gap-2 rounded-lg border border-card-border/60 bg-background-gray-secondary/20 p-2.5 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1 space-y-1 rounded-md border border-card-border/40 bg-card-background p-2.5">
                <span className="text-[11px] font-medium text-text-tertiary">
                  Giá trị trước
                </span>
                <p className="break-words text-xs text-text-secondary line-through decoration-error-500/50">
                  {formatStudentAuditValue(event.oldValue)}
                </p>
              </div>
              <div className="flex shrink-0 items-center justify-center text-text-tertiary">
                <ArrowRight size={14} className="rotate-90 sm:rotate-0" />
              </div>
              <div className="min-w-0 flex-1 space-y-1 rounded-md border border-success-500/20 bg-badge-success-background/30 p-2.5">
                <span className="text-[11px] font-medium text-success-600">
                  Giá trị mới
                </span>
                <p className="break-words text-xs font-semibold text-text-primary">
                  {formatStudentAuditValue(event.newValue)}
                </p>
              </div>
            </div>
          )}
          {event.reason && (
            <p className="text-xs text-text-secondary">Lý do: {event.reason}</p>
          )}
          {event.metadata && Object.keys(event.metadata).length > 0 && (
            <div className="flex flex-wrap gap-1.5 text-[11px] text-text-tertiary">
              {Object.entries(event.metadata)
                .filter(
                  ([key, value]) =>
                    !isStudentAuditIdentifierKey(key) &&
                    value !== null &&
                    value !== undefined &&
                    value !== "",
                )
                .map(([key, value]) => (
                  <span
                    key={key}
                    className="rounded-md border border-card-border/50 bg-background-gray-secondary/40 px-2 py-1"
                  >
                    {formatAuditMetadataKey(key)}:{" "}
                    {formatStudentAuditValue(value)}
                  </span>
                ))}
            </div>
          )}
        </div>
      )}

      {!compact && (
        <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-text-tertiary">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-card-border/50 bg-background-gray-secondary/40 px-2 py-1 text-text-secondary">
            <FileText size={12} className="text-text-tertiary" />
            <span>
              Nguồn cập nhật: {getStudentAuditSourceLabel(event.source)}
            </span>
          </span>
          {event.doctype && (
            <span className="rounded-md border border-card-border/40 bg-background-gray-secondary/30 px-2 py-1 text-text-secondary">
              Loại dữ liệu:{" "}
              <span className="font-medium text-text-primary">
                {getStudentAuditDoctypeLabel(event.doctype)}
              </span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
