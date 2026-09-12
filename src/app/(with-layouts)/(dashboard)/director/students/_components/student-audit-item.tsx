"use client";

import { ArrowRight } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import type { StudentAuditLog } from "@/services/api/student-audit";
import { formatDateTime } from "@/utils/format-date";

import {
  formatStudentAuditRelativeTime,
  formatStudentAuditContent,
  formatStudentAuditSubject,
  formatStudentAuditValue,
  getStudentAuditActor,
  getStudentAuditCategoryLabel,
  getStudentAuditDoctypeLabel,
  getStudentAuditSourceLabel,
  getStudentAuditStatus,
  getStudentAuditTone,
  isStudentAuditFieldChange,
  StudentAuditMetadata,
} from "./student-audit-event";

interface StudentAuditItemProps {
  event: StudentAuditLog;
  recordLabel?: string;
}

export default function StudentAuditItem({
  event,
  recordLabel = "hồ sơ học sinh",
}: StudentAuditItemProps) {
  const actor = getStudentAuditActor(event);
  const role = getStudentAuditActorRole(event);
  const tone = getStudentAuditTone(event);
  const status = getStudentAuditStatus(event);
  const categoryLabel = getStudentAuditCategoryLabel(event.category);
  const isFieldChange = isStudentAuditFieldChange(event);
  const fileUrl =
    typeof event.metadata?.file_url === "string"
      ? event.metadata.file_url
      : null;
  const content = formatStudentAuditContent(event.content);
  const subject = formatStudentAuditSubject(event.subject);

  const dotColorClass =
    tone === "success"
      ? "bg-success-500"
      : tone === "error"
        ? "bg-error-500"
        : tone === "warning"
          ? "bg-warning-500"
          : "bg-badge-sky-text";

  return (
    <li className="relative">
      {/* Node Dot on Timeline Rail */}
      <span
        className="absolute -left-[2.05rem] top-0 flex size-7 items-center justify-center rounded-full border-2 border-card-background bg-card-background shadow-sm"
        aria-hidden="true"
      >
        <span className={`size-2.5 rounded-full ${dotColorClass}`} />
      </span>

      {/* Header: Actor, Role, Source & Timestamp */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-primary">
            {actor}
            {role ? (
              <span className="ml-2 font-normal text-text-tertiary">
                · {role}
              </span>
            ) : null}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-tertiary">
            <span className="font-medium text-text-secondary">
              {getStudentAuditSourceLabel(event.source)}
            </span>
            {event.doctype ? (
              <span>· {getStudentAuditDoctypeLabel(event.doctype)}</span>
            ) : null}
          </div>
        </div>
        <time
          className="shrink-0 text-xs text-text-tertiary"
          dateTime={event.occurredAt}
          title={formatStudentAuditRelativeTime(event.occurredAt)}
        >
          {formatDateTime(event.occurredAt)}
        </time>
      </div>

      {/* Content Bubble Box */}
      <div className="mt-3 w-full max-w-3xl rounded-xl border border-card-border/60 bg-background-gray-secondary/40 px-4 py-4 sm:px-5">
        {isFieldChange ? (
          <div className="space-y-2">
            <p className="text-sm leading-6 text-text-primary">
              Cập nhật trường{" "}
              <span className="font-semibold text-text-primary">
                {event.fieldLabel || "dữ liệu"}
              </span>
              :
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-lg border border-card-border/60 bg-card-background px-2.5 py-1 text-text-secondary line-through decoration-error-500/50">
                {formatStudentAuditValue(event.oldValue)}
              </span>
              <ArrowRight size={13} className="shrink-0 text-text-tertiary" />
              <span className="rounded-lg border border-success-500/30 bg-badge-success-background/40 px-2.5 py-1 font-semibold text-text-primary">
                {formatStudentAuditValue(event.newValue)}
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-semibold leading-6 text-text-primary">
              {getAuditRecordTitle(event, recordLabel)}
            </p>
            {subject && (
              <p className="text-xs font-medium text-text-primary">{subject}</p>
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
            <StudentAuditMetadata event={event} />
          </div>
        )}
      </div>

      {/* Badges / Meta Pills */}
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
        {(!event.eventType || !categoryLabel) && (
          <Badge color={tone} size="sm">
            {status}
          </Badge>
        )}
        {categoryLabel && (
          <Badge color="sky" size="sm">
            {categoryLabel}
          </Badge>
        )}
      </div>
      {event.reason && (
        <p className="mt-2 text-xs leading-5 text-text-secondary">
          Lý do: {event.reason}
        </p>
      )}
    </li>
  );
}

function getAuditRecordTitle(
  event: StudentAuditLog,
  recordLabel: string,
): string {
  switch (event.eventType) {
    case "comment_added":
      return "Đã thêm bình luận.";
    case "communication_recorded":
      return "Đã ghi nhận Email / Communication.";
    case "attachment_added":
      return "Đã đính kèm tệp.";
    case "call_logged":
      return "Đã ghi nhận cuộc gọi.";
    case "note_added":
      return "Đã thêm FCRM Note.";
    case "note_updated":
      return "Đã cập nhật FCRM Note.";
    case "task_recorded":
      return "Đã ghi nhận task.";
    case "interaction_recorded":
      return "Đã ghi nhận tương tác CRM.";
    case "sla_event_recorded":
      return "Đã ghi nhận sự kiện SLA.";
    case "decision_recorded":
      return "Đã ghi nhận quyết định.";
    case "consent_recorded":
      return "Đã ghi nhận consent / privacy.";
    case "conversion_completed":
      return "Đã hoàn tất chuyển đổi.";
  }

  if (event.action === "created") {
    return `Đã tạo ${recordLabel} thành công.`;
  }
  if (event.action === "deleted") {
    return event.restored
      ? `Đã khôi phục ${recordLabel} sau khi bị xóa.`
      : `Đã xóa ${recordLabel} khỏi hệ thống.`;
  }

  return `Đã cập nhật thông tin ${recordLabel}.`;
}

function getStudentAuditActorRole(event: StudentAuditLog): string | null {
  const actor = (event.ownerFullName || event.owner || "").toLowerCase();
  if (actor.includes("admin")) return "Quản trị viên";
  if (actor.includes("system")) return "Hệ thống";
  if (actor.includes("trưởng nhóm") || actor.includes("tư vấn viên")) {
    return null;
  }
  if (actor.includes("ctv")) return "CTV Sale";
  if (actor.includes("sale")) return "Nhân viên Sale";
  return "Tư vấn viên";
}
