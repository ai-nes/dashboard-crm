"use client";

import { ArrowLeft, Envelope1, MapMarker5, Phone } from "@tailgrids/icons";
import Link from "next/link";

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
} from "@/components/tailgrids/core/avatar";
import { Badge } from "@/components/tailgrids/core/badge";

import StudentCopyBadge from "../../students/_components/student-copy-badge";
import { leadStatusColor } from "./mappings";
import type { LeadDetail } from "./types";

export default function LeadHeader({ lead }: { lead: LeadDetail }) {
  return (
    <header className="min-w-0 shrink-0">
      <Link
        href="/lead-sale/leads"
        className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-button-primary-focus-ring"
      >
        <ArrowLeft size={16} />
        Danh sách lead
      </Link>

      <div className="min-w-0 overflow-hidden rounded-2xl border border-card-border bg-card-background">
        <div className="min-w-0 p-3 lg:p-4">
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
                <Badge color={leadStatusColor[lead.status]}>{lead.status}</Badge>
                <Badge color="primary">{lead.source}</Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs text-text-secondary">
                {lead.phone && (
                  <StudentCopyBadge icon={Phone} label="số điện thoại" value={lead.phone}>
                    {lead.phone}
                  </StudentCopyBadge>
                )}
                {lead.email && (
                  <StudentCopyBadge icon={Envelope1} label="email" value={lead.email}>
                    {lead.email}
                  </StudentCopyBadge>
                )}
                <span className="flex items-center gap-1.5">
                  <MapMarker5 size={14} className="text-icon-tertiary" aria-hidden="true" />
                  {lead.school || "-"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 grid divide-y divide-card-border border-t border-card-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <HeaderFact label="Giao cho" value={lead.owner} />
            <HeaderFact label="Chi nhánh" value={lead.branch} />
            <HeaderFact label="Năm tuyển sinh" value={String(lead.enrollmentYear)} />
          </div>
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
      <p className="mt-0.5 truncate text-sm font-semibold text-text-primary" title={displayValue}>
        {displayValue}
      </p>
    </div>
  );
}
