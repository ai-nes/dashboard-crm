"use client";

import {
  ArrowLeft,
  Copy1,
  Envelope1,
  MapMarker5,
  Phone,
  Trash1,
} from "@tailgrids/icons";
import Link from "next/link";
import type { ReactNode } from "react";

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
} from "@/components/tailgrids/core/avatar";
import { Button } from "@/components/tailgrids/core/button";
import { formatDate, formatDateTime } from "@/utils/format-date";

import StudentCopyBadge from "../../students/_components/student-copy-badge";
import type { LeadDetail } from "./types";

export default function LeadHeader({
  lead,
  children,
  createdAt,
  backHref = "/lead-sale/leads",
  onDeleteRequest,
}: {
  lead: LeadDetail;
  children?: ReactNode;
  createdAt?: string;
  backHref?: string;
  onDeleteRequest?: () => void;
}) {
  const subtitle = [
    lead.branch,
    lead.enrollmentYear ? `Kỳ ${lead.enrollmentYear}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <header className="min-w-0 shrink-0">
      <Link
        href={backHref}
        className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-button-primary-focus-ring"
      >
        <ArrowLeft size={16} />
        Danh sách Leads
      </Link>

      <div className="min-w-0 overflow-hidden rounded-2xl border border-card-border bg-card-background">
        <div className="min-w-0 p-3 lg:p-4">
          <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <div className="flex min-w-0 items-start gap-3">
              <Avatar size="md">
                <AvatarFallback>{lead.initials || "L"}</AvatarFallback>
                <AvatarBadge size="md" status="online" />
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 flex-wrap items-center gap-3">
                  <h1 className="min-w-0 text-balance text-xl font-semibold tracking-[-0.4px] text-text-primary lg:text-2xl lg:leading-8">
                    {lead.name || "-"}
                  </h1>
                </div>

                <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm text-text-tertiary">
                  <StudentCopyBadge
                    className="h-auto rounded-none bg-transparent px-0 text-sm text-text-tertiary hover:bg-transparent hover:text-text-primary"
                    icon={Copy1}
                    label="mã lead"
                    showLeadingIcon={false}
                    value={lead.leadCode || lead.id}
                  >
                    Mã Lead: {lead.leadCode || lead.id}
                  </StudentCopyBadge>
                  {subtitle && <span aria-hidden="true">·</span>}
                  {subtitle && <span>{subtitle}</span>}
                </div>

                {(lead.source || lead.interestedMajor) && (
                  <div className="mt-2 flex min-w-0 flex-wrap gap-x-5 gap-y-1 text-sm text-text-secondary">
                    {lead.source && (
                      <span className="min-w-0 truncate">
                        Nguồn: {lead.source}
                      </span>
                    )}
                    {lead.interestedMajor && (
                      <span className="min-w-0 truncate">
                        Quan tâm ngành: {lead.interestedMajor}
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-2 flex min-w-0 flex-wrap gap-x-5 gap-y-2 text-xs text-text-secondary">
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
                  <span className="flex min-w-0 items-center gap-1.5">
                    <MapMarker5
                      size={14}
                      className="shrink-0 text-icon-tertiary"
                      aria-hidden="true"
                    />
                    <span className="truncate">{lead.school || "-"}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:pt-1">
              {onDeleteRequest && (
                <Button
                  aria-label="Xóa Lead"
                  appearance="ghost"
                  onPress={onDeleteRequest}
                  size="sm"
                  variant="danger"
                >
                  <Trash1 size={15} aria-hidden="true" />
                  Xóa Lead
                </Button>
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
