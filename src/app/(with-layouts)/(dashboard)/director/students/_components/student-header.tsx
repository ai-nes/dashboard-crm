"use client";

import {
  ArrowLeft,
  Copy1,
  Envelope1,
  MapMarker5,
  Phone,
  Sparkle,
} from "@tailgrids/icons";
import Link from "next/link";

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
} from "@/components/tailgrids/core/avatar";
import { Badge } from "@/components/tailgrids/core/badge";
import { formatDateTime } from "@/utils/format-date";
import type {
  StudentContactConsent,
  StudentPriority,
  StudentVerificationStatus,
} from "@/services/api/students/types";

import StudentCopyBadge from "./student-copy-badge";
import StudentGaugeChart from "./student-gauge-chart";
import type { Student360SectionProps } from "./types";

export default function StudentHeader({ data }: Student360SectionProps) {
  const { student } = data;
  const subtitle = student.grade || "-";
  const hasMetadata = Boolean(
    student.verificationStatus ||
    student.contactConsent ||
    student.lastUpdatedAt,
  );
  const scoreCandidate = data.insight.signalScore ?? data.insight.probability;
  const score =
    typeof scoreCandidate === "number" && Number.isFinite(scoreCandidate)
      ? scoreCandidate
      : null;

  return (
    <header className="min-w-0 shrink-0">
      <Link
        href="/director/students"
        className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-button-primary-focus-ring"
      >
        <ArrowLeft size={16} />
        Danh sách học sinh
      </Link>

      <div className="min-w-0 overflow-hidden rounded-2xl border border-card-border bg-card-background">
        <div className="min-w-0 p-3 lg:p-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-center">
            <div className="flex min-w-0 items-start gap-3">
              <Avatar size="md">
                <AvatarFallback>{student.initials || "HS"}</AvatarFallback>
                <AvatarBadge size="md" status="online" />
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="min-w-0 text-balance text-xl font-semibold tracking-[-0.4px] text-text-primary lg:text-2xl lg:leading-8">
                    {student.name || "-"}
                  </h1>
                  {student.priority && (
                    <Badge color={getPriorityColor(student.priority)}>
                      Ưu tiên {student.priority.toLowerCase()}
                    </Badge>
                  )}
                  {student.verificationStatus && (
                    <Badge
                      color={getVerificationColor(student.verificationStatus)}
                    >
                      {student.verificationStatus}
                    </Badge>
                  )}
                  <Badge color="primary">
                    {data.segmentation?.learningStage || "Đang tư vấn"}
                  </Badge>
                  {student.code && (
                    <StudentCopyBadge
                      icon={Copy1}
                      label="mã học sinh"
                      value={student.code}
                    >
                      Sao chép ID
                    </StudentCopyBadge>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-text-tertiary">
                  <span>{subtitle}</span>
                  {student.major && (
                    <Badge
                      color="violet"
                      prefixIcon={<Sparkle size={12} aria-hidden="true" />}
                    >
                      Quan tâm ngành: {student.major}
                    </Badge>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs text-text-secondary">
                  {student.phone && (
                    <StudentCopyBadge
                      icon={Phone}
                      label="số điện thoại"
                      value={student.phone}
                    >
                      {student.phone}
                    </StudentCopyBadge>
                  )}
                  {student.email && (
                    <StudentCopyBadge
                      icon={Envelope1}
                      label="email"
                      value={student.email}
                    >
                      {student.email}
                    </StudentCopyBadge>
                  )}
                  <span className="flex items-center gap-1.5">
                    <MapMarker5
                      size={14}
                      className="text-icon-tertiary"
                      aria-hidden="true"
                    />
                    {student.school || "-"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-center border-t border-card-border pt-3 lg:border-t-0 lg:pt-0">
              {score === null ? (
                <div
                  className="flex min-h-28 items-center justify-center text-sm font-medium text-text-tertiary"
                  role="status"
                >
                  Chưa có dữ liệu
                </div>
              ) : (
                <StudentGaugeChart score={score} label="Điểm tiềm năng" />
              )}
            </div>
          </div>

          <div className="mt-3 grid divide-y divide-card-border border-t border-card-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <HeaderFact label="Phụ trách" value={student.counselor || "-"} />
            <HeaderFact
              label="Người quyết định"
              value={data.insight.decisionMaker || "-"}
            />
            <HeaderFact label="Rào cản" value={data.insight.concern || "-"} />
          </div>
          {hasMetadata && (
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 border-t border-card-border pt-3 text-xs">
              {student.contactConsent && (
                <HeaderMeta
                  label="Đồng ý tư vấn"
                  value={formatConsent(student.contactConsent)}
                />
              )}
              {student.lastUpdatedAt && (
                <HeaderMeta
                  label="Cập nhật"
                  value={formatDateTime(student.lastUpdatedAt)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function HeaderFact({ label, value }: { label: string; value: string }) {
  const displayValue = value || "-";
  return (
    <div className="min-w-0 px-3 py-2">
      <p className="text-[11px] text-text-tertiary">{label}</p>
      <p
        className="mt-0.5 truncate text-sm font-semibold text-text-primary"
        title={displayValue}
      >
        {displayValue}
      </p>
    </div>
  );
}

function HeaderMeta({ label, value }: { label: string; value: string }) {
  return (
    <span className="min-w-0">
      <span className="text-text-tertiary">{label}: </span>
      <span className="font-medium text-text-secondary">{value || "-"}</span>
    </span>
  );
}

function formatConsent(consent: StudentContactConsent): string {
  const channels = consent.channels
    .filter((channel) => channel !== "Zalo")
    .join(", ");
  return channels ? `${consent.status} · ${channels}` : consent.status;
}

function getPriorityColor(priority: StudentPriority) {
  if (priority === "Cao") return "success" as const;
  if (priority === "Thấp") return "gray" as const;
  return "warning" as const;
}

function getVerificationColor(status: StudentVerificationStatus) {
  if (status === "Đã xác thực") return "success" as const;
  if (status === "Cần xác minh") return "warning" as const;
  return "gray" as const;
}
