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
    case "comment":
      return "Bình luận";
    case "communication":
      return "Email / Communication";
    case "file":
      return "Tệp đính kèm";
    case "call log":
      return "Nhật ký cuộc gọi";
    case "fcrm note":
      return "Ghi chú FCRM";
    case "task":
      return "Task";
    case "crm action item":
      return "Action Item";
    case "crm interaction":
      return "Tương tác CRM";
    case "lifecycle event":
      return "Sự kiện vòng đời";
    case "ownership event":
      return "Sự kiện phân công";
    case "outcome event":
      return "Sự kiện kết quả";
    case "marketing engagement":
      return "Tương tác marketing";
    case "sla event":
      return "Sự kiện SLA";
    case "decision event":
      return "Sự kiện quyết định";
    case "consent event":
      return "Sự kiện consent";
    case "conversion event":
      return "Sự kiện chuyển đổi";
    default:
      return source || "Hồ sơ tuyển sinh";
  }
}

export function getStudentAuditDoctypeLabel(doctype?: string | null): string {
  if (doctype === "CRM Segment") return "Segment";
  return doctype === "CRM Lead" || doctype === "CRM Student"
    ? "Hồ sơ học sinh"
    : doctype || "Hồ sơ";
}

export function getStudentAuditActionLabel(event: StudentAuditLog): string {
  switch (event.eventType) {
    case "comment_added":
      return "Thêm bình luận";
    case "communication_recorded":
      return "Ghi nhận Email / Communication";
    case "attachment_added":
      return "Đính kèm tệp";
    case "call_logged":
      return "Ghi nhận cuộc gọi";
    case "note_added":
      return "Thêm ghi chú FCRM";
    case "note_updated":
      return "Cập nhật ghi chú FCRM";
    case "task_recorded":
      return "Ghi nhận task";
    case "interaction_recorded":
      return "Ghi nhận tương tác CRM";
    case "sla_event_recorded":
      return "Ghi nhận sự kiện SLA";
    case "decision_recorded":
      return "Ghi nhận quyết định";
    case "consent_recorded":
      return "Ghi nhận consent / privacy";
    case "conversion_completed":
      return "Hoàn tất chuyển đổi";
  }

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
    case "comment":
      return "Bình luận";
    case "communication":
      return "Email / Communication";
    case "attachment":
      return "Tệp đính kèm";
    case "call":
      return "Cuộc gọi";
    case "note":
      return "Ghi chú FCRM";
    case "task":
      return "Task";
    case "interaction":
      return "Tương tác";
    case "engagement":
      return "Marketing";
    case "sla":
      return "SLA";
    case "decision":
      return "Quyết định";
    case "consent":
      return "Consent / privacy";
    default:
      return null;
  }
}

export function getStudentAuditActivityDescription(
  event: StudentAuditLog,
  recordLabel = "hồ sơ học sinh",
): string {
  switch (event.eventType) {
    case "comment_added":
      return "đã thêm bình luận";
    case "communication_recorded":
      return "đã ghi nhận Email / Communication";
    case "attachment_added":
      return "đã đính kèm tệp";
    case "call_logged":
      return "đã ghi nhận cuộc gọi";
    case "note_added":
      return "đã thêm ghi chú FCRM";
    case "note_updated":
      return "đã cập nhật ghi chú FCRM";
    case "task_recorded":
      return "đã ghi nhận task";
    case "interaction_recorded":
      return "đã ghi nhận tương tác CRM";
    case "sla_event_recorded":
      return "đã ghi nhận sự kiện SLA";
    case "decision_recorded":
      return "đã ghi nhận quyết định";
    case "consent_recorded":
      return "đã ghi nhận consent / privacy";
    case "conversion_completed":
      return "đã hoàn tất chuyển đổi";
  }

  if (event.action === "created") return `đã tạo ${recordLabel}`;
  if (event.action === "deleted") {
    return event.restored
      ? `đã xóa rồi khôi phục ${recordLabel}`
      : `đã xóa ${recordLabel}`;
  }

  const field = event.fieldLabel;
  if (event.changeType === "added") {
    return `đã thêm ${field || "dữ liệu hồ sơ"}`;
  }
  if (event.changeType === "removed") {
    return `đã xóa ${field || "dữ liệu hồ sơ"}`;
  }
  return `đã cập nhật ${field || recordLabel}`;
}

export function getStudentAuditStatus(event: StudentAuditLog): string {
  switch (event.eventType) {
    case "comment_added":
      return "Đã thêm bình luận";
    case "communication_recorded":
      return "Đã ghi nhận email";
    case "attachment_added":
      return "Đã đính kèm";
    case "call_logged":
      return "Đã ghi nhận cuộc gọi";
    case "note_added":
      return "Đã thêm ghi chú";
    case "note_updated":
      return "Đã cập nhật ghi chú";
    case "task_recorded":
      return "Đã ghi nhận task";
    case "interaction_recorded":
      return "Đã ghi nhận tương tác";
    case "sla_event_recorded":
      return "Đã ghi nhận SLA";
    case "decision_recorded":
      return "Đã ghi nhận quyết định";
    case "consent_recorded":
      return "Đã ghi nhận consent";
    case "conversion_completed":
      return "Đã hoàn tất chuyển đổi";
  }

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
  if (
    event.category === "assignment" ||
    event.category === "processing" ||
    event.category === "task" ||
    event.category === "decision"
  ) {
    return "warning";
  }
  if (event.changeType === "removed") return "warning";
  return "primary";
}

export function isStudentAuditFieldChange(event: StudentAuditLog): boolean {
  return (
    event.action === "updated" && Boolean(event.fieldname || event.fieldLabel)
  );
}

export function formatStudentAuditContent(value?: string | null): string {
  return (value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const AUDIT_SUBJECT_LABELS: Record<string, string> = {
  call: "Cuộc gọi",
  communication: "Email / Communication",
  note: "Ghi chú",
  task: "Task",
};

export function formatStudentAuditSubject(value?: string | null): string {
  const subject = value?.trim() || "";
  if (!subject) return "";

  return AUDIT_SUBJECT_LABELS[subject.toLocaleLowerCase("en-US")] || subject;
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

const AUDIT_METADATA_VALUE_LABELS: Record<string, Record<string, string>> = {
  state: {
    accepted: "Đã chấp nhận",
    canceled: "Đã hủy",
    completed: "Đã hoàn tất",
    pending: "Đang chờ",
    rejected: "Đã từ chối",
  },
  priority: {
    high: "Cao",
    low: "Thấp",
    medium: "Trung bình",
  },
  outcome_code: {
    CONTACTED: "Đã liên hệ",
    NO_RESPONSE: "Không phản hồi",
    SUCCESS: "Thành công",
  },
  channel: {
    email: "Email",
    internal: "Nội bộ",
    phone: "Điện thoại",
    zalo: "Zalo",
  },
  direction: {
    inbound: "Đến",
    internal: "Nội bộ",
    outbound: "Đi",
  },
};

export function formatStudentAuditMetadataValue(
  key: string,
  value: unknown,
): string {
  if (typeof value === "boolean") return value ? "Có" : "Không";

  const normalizedKey = key.toLocaleLowerCase("en-US");
  if (typeof value === "string") {
    const label =
      AUDIT_METADATA_VALUE_LABELS[normalizedKey]?.[value] ||
      AUDIT_METADATA_VALUE_LABELS[normalizedKey]?.[
        value.toLocaleLowerCase("en-US")
      ];
    if (label) return label;

    if (normalizedKey === "due_at") {
      return formatDateTime(value, value);
    }

    if (normalizedKey === "duration_seconds") {
      const seconds = Number(value);
      if (Number.isFinite(seconds)) return formatAuditDuration(seconds);
    }
  }

  if (normalizedKey === "duration_seconds" && typeof value === "number") {
    return formatAuditDuration(value);
  }

  return formatStudentAuditValue(value);
}

function formatAuditDuration(seconds: number): string {
  const totalSeconds = Math.max(0, Math.round(seconds));
  if (totalSeconds === 0) return "0 giây";
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  if (minutes === 0) return `${remainingSeconds} giây`;
  if (remainingSeconds === 0) return `${minutes} phút`;
  return `${minutes} phút ${remainingSeconds} giây`;
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
  const isFieldChange = isStudentAuditFieldChange(event);

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
        </div>
      )}

      {!isFieldChange && (
        <StudentAuditRecordContent event={event} compact={compact} />
      )}
      {event.reason && !isFieldChange && (
        <p className="text-xs text-text-secondary">Lý do: {event.reason}</p>
      )}
      <StudentAuditMetadata event={event} />

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

export function StudentAuditRecordContent({
  event,
  compact = false,
}: {
  event: StudentAuditLog;
  compact?: boolean;
}) {
  const content = formatStudentAuditContent(event.content);
  const subject = formatStudentAuditSubject(event.subject);
  const fileUrl =
    typeof event.metadata?.file_url === "string"
      ? event.metadata.file_url
      : null;

  if (!content && !subject && !fileUrl) return null;

  return (
    <div className={compact ? "space-y-1" : "space-y-2"}>
      {subject && (
        <p className="text-xs font-semibold text-text-primary">{subject}</p>
      )}
      {content && (
        <p className="whitespace-pre-wrap break-words text-xs leading-5 text-text-secondary">
          {content}
        </p>
      )}
      {fileUrl && (
        <a
          href={fileUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex text-xs font-medium text-primary-600 underline-offset-2 hover:underline"
        >
          Mở tệp đính kèm
        </a>
      )}
    </div>
  );
}

export function StudentAuditMetadata({ event }: { event: StudentAuditLog }) {
  if (!event.metadata || Object.keys(event.metadata).length === 0) return null;

  const entries = Object.entries(event.metadata).filter(
    ([key, value]) =>
      !isStudentAuditIdentifierKey(key) &&
      value !== null &&
      value !== undefined &&
      value !== "",
  );
  if (entries.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 text-[11px] text-text-tertiary">
      {entries.map(([key, value]) => (
        <span
          key={key}
          className="inline-flex max-w-full flex-wrap items-baseline gap-x-1.5 gap-y-0.5 rounded-md border border-card-border/50 bg-background-gray-secondary/40 px-2.5 py-1.5"
        >
          <span className="font-medium text-text-secondary">
            {formatAuditMetadataKey(key)}
          </span>
          <span className="break-words text-text-primary">
            {formatStudentAuditMetadataValue(key, value)}
          </span>
        </span>
      ))}
    </div>
  );
}
