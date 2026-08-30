"use client";

import { ArrowLeft, Envelope1, MapMarker5, Phone } from "@tailgrids/icons";
import Link from "next/link";

import { Avatar, AvatarBadge, AvatarFallback } from "@/components/tailgrids/core/avatar";
import { Badge } from "@/components/tailgrids/core/badge";

import type { Student360SectionProps } from "./types";

export default function StudentHeader({ data }: Student360SectionProps) {
  const { student } = data;
  const subtitle = [student.code, student.grade, student.major ? `Quan tâm ${student.major}` : undefined].filter(Boolean).join(" · ") || "-";

  return (
    <header className="overflow-hidden rounded-2xl border border-card-border bg-card-background shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-card-border bg-card-background px-5 py-3 lg:px-6">
        <Link href="/director/students" className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary outline-none hover:text-primary-500 focus-visible:ring-4 focus-visible:ring-button-outline-focus-ring"><ArrowLeft size={16} />Danh sách học sinh</Link>
        <div className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-success-500" aria-hidden="true" /><span className="text-xs text-text-tertiary">Cập nhật 4 phút trước</span></div>
      </div>

      <div className="grid min-w-0">
        <div className="min-w-0 p-5 lg:p-6">
          <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start">
            <Avatar size="xxl"><AvatarFallback>{student.initials || "HS"}</AvatarFallback><AvatarBadge size="xxl" status="online" /></Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><span className="text-[10px] font-semibold tracking-[0.14em] text-brand-500 uppercase">{data.segmentation?.learningStage || "Đang tư vấn"}</span><Badge color="success">Ưu tiên cao</Badge></div>
              <h1 className="mt-2 text-balance text-[32px] leading-9 font-semibold tracking-[-0.8px] text-text-primary">{student.name || "-"}</h1>
              <p className="mt-1 text-sm text-text-tertiary">{subtitle}</p>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-text-secondary">
                <span className="flex items-center gap-1.5"><Phone size={15} className="text-icon-tertiary" aria-hidden="true" />{student.phone || "-"}</span>
                <span className="flex items-center gap-1.5"><Envelope1 size={15} className="text-icon-tertiary" aria-hidden="true" />{student.email || "-"}</span>
                <span className="flex items-center gap-1.5"><MapMarker5 size={15} className="text-icon-tertiary" aria-hidden="true" />{student.school || "-"}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <HeaderFact label="Phụ trách" value={student.counselor || "-"} tone="neutral" />
            <HeaderFact label="Người quyết định" value={data.insight.decisionMaker || "-"} tone="primary" />
            <HeaderFact label="Rào cản" value={data.insight.concern || "-"} tone="warning" />
          </div>
        </div>
      </div>
    </header>
  );
}

function HeaderFact({ label, value, tone }: { label: string; value: string; tone: "neutral" | "warning" | "primary" }) {
  const displayValue = value || "-";
  const toneClass = tone === "warning" ? "border-warning-500/30 bg-badge-warning-background" : tone === "primary" ? "border-primary-200 bg-badge-primary-background" : "border-card-border bg-card-background";
  return <div className={`min-w-0 rounded-xl border p-3 ${toneClass}`}><p className="text-[11px] text-text-tertiary">{label}</p><p className="mt-1 truncate text-sm font-semibold text-text-primary" title={displayValue}>{displayValue}</p></div>;
}
