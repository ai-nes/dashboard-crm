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
import type { ReactNode } from "react";

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
} from "@/components/tailgrids/core/avatar";
import { Badge } from "@/components/tailgrids/core/badge";
import { formatDate, formatDateTime } from "@/utils/format-date";

import StudentCopyBadge from "../../students/_components/student-copy-badge";
import StudentGaugeChart from "../../students/_components/student-gauge-chart";
import { conversionPotentialScore, leadStatusColor } from "./mappings";
import type { LeadDetail } from "./types";

export default function LeadHeader({
  lead,
  children,
  createdAt,
}: {
  lead: LeadDetail;
  children?: ReactNode;
  createdAt?: string;
}) {
  const subtitle = [
    lead.branch,
    lead.enrollmentYear ? `Kỳ ${lead.enrollmentYear}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const score = conversionPotentialScore(lead.conversionPotential);

  return (
    <header className="min-w-0 shrink-0">
      <Link
        href="/lead-sale/leads"
        className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-button-primary-focus-ring"
      >
        <ArrowLeft size={16} />
        Danh sách Leads
      </Link>

      <div className="min-w-0 overflow-hidden rounded-2xl border border-card-border bg-card-background">
        <div className="min-w-0 p-3 lg:p-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-center">
            <div className="flex min-w-0 items-start gap-3">
              <Avatar size="md">
                <AvatarFallback>{lead.initials || "L"}</AvatarFallback>
                <AvatarBadge size="md" status="online" />
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="min-w-0 text-balance text-xl font-semibold tracking-[-0.4px] text-text-primary lg:text-2xl lg:leading-8">
                    {lead.name || "-"}
                  </h1>
                  <Badge color={leadStatusColor(lead.status)}>
                    {lead.status || "-"}
                  </Badge>
                  {lead.source && <Badge color="primary">{lead.source}</Badge>}
                  <StudentCopyBadge
                    icon={Copy1}
                    label="mã lead"
                    value={lead.id}
                  >
                    Sao chép ID
                  </StudentCopyBadge>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-text-tertiary">
                  {subtitle && <span>{subtitle}</span>}
                  {lead.interestedMajor && (
                    <Badge
                      color="violet"
                      prefixIcon={<Sparkle size={12} aria-hidden="true" />}
                    >
                      Quan tâm ngành: {lead.interestedMajor}
                    </Badge>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs text-text-secondary">
                  {lead.phone && (
                    <StudentCopyBadge
                      icon={Phone}
                      label="số điện thoại"
                      value={lead.phone}
                    >
                      {lead.phone}
                    </StudentCopyBadge>
                  )}
                  {lead.email && (
                    <StudentCopyBadge
                      icon={Envelope1}
                      label="email"
                      value={lead.email}
                    >
                      {lead.email}
                    </StudentCopyBadge>
                  )}
                  <span className="flex items-center gap-1.5">
                    <MapMarker5
                      size={14}
                      className="text-icon-tertiary"
                      aria-hidden="true"
                    />
                    {lead.school || "-"}
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
                <StudentGaugeChart score={score} label="Khả năng chuyển đổi" />
              )}
            </div>
          </div>

          {children}
          {(createdAt || lead.modifiedAt) && (
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 border-t border-card-border pt-3 text-xs">
              {createdAt && (
                <HeaderMeta label="Ngày tạo" value={formatDate(createdAt)} />
              )}
              {lead.modifiedAt && (
                <HeaderMeta
                  label="Cập nhật"
                  value={formatDateTime(lead.modifiedAt)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </header>
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
