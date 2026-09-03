"use client";

import { ArrowRight } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import type { StudentAuditLog } from "@/services/api/student-audit";
import { formatDateTime } from "@/utils/format-date";

import {
  formatStudentAuditRelativeTime,
  formatStudentAuditValue,
  getStudentAuditActor,
  getStudentAuditStatus,
  getStudentAuditTone,
} from "./student-audit-event";

interface StudentAuditItemProps {
  event: StudentAuditLog;
}

export default function StudentAuditItem({ event }: StudentAuditItemProps) {
  const actor = getStudentAuditActor(event);
  const role = getStudentAuditActorRole(event);
  const tone = getStudentAuditTone(event);
  const status = getStudentAuditStatus(event);
  const isFieldChange = event.action === "updated";

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
              <span className="ml-2 font-normal text-text-tertiary">{role}</span>
            ) : null}
          </p>
          <p className="mt-0.5 text-xs text-text-tertiary">
            Nguồn: {event.source || "Tài liệu"}
            {event.sourceName ? ` · ${event.sourceName}` : ""}
            {event.doctype ? ` (${event.doctype})` : ""}
          </p>
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
      <div className="mt-3 w-fit max-w-2xl rounded-2xl rounded-bl-md bg-background-gray-secondary px-4 py-3">
        {event.action === "created" ? (
          <p className="text-sm leading-6 text-text-primary">
            Đã tạo hồ sơ học sinh{" "}
            {event.docname ? (
              <span className="font-semibold text-text-primary">{event.docname}</span>
            ) : (
              ""
            )}{" "}
            thành công.
          </p>
        ) : event.action === "deleted" ? (
          <p className="text-sm leading-6 text-text-primary">
            {event.restored
              ? "Đã khôi phục hồ sơ học sinh sau khi bị xóa."
              : "Đã xóa hồ sơ học sinh khỏi hệ thống."}
          </p>
        ) : isFieldChange ? (
          <div className="space-y-2">
            <p className="text-sm leading-6 text-text-primary">
              Cập nhật trường{" "}
              <span className="font-semibold text-text-primary">
                {event.fieldLabel || event.fieldname || "dữ liệu"}
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
          <p className="text-sm leading-6 text-text-primary">
            Đã cập nhật thông tin hồ sơ học sinh.
          </p>
        )}
      </div>

      {/* Badges / Meta Pills */}
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
        <Badge color={tone} size="sm">
          {status}
        </Badge>
        {event.source && (
          <Badge color="gray" size="sm">
            {event.source}
          </Badge>
        )}
        {event.sourceName && (
          <span className="font-mono text-xs text-text-tertiary">
            #{event.sourceName}
          </span>
        )}
      </div>
    </li>
  );
}

function getStudentAuditActorRole(event: StudentAuditLog): string {
  const actor = (event.ownerFullName || event.owner || "").toLowerCase();
  if (actor.includes("admin")) return "Quản trị viên";
  if (actor.includes("system")) return "Hệ thống";
  return "Tư vấn viên";
}
