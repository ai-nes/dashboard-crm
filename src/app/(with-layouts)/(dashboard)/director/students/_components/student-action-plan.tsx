"use client";

import { Envelope1, Phone } from "@tailgrids/icons";

import type { Student360SectionProps } from "./types";

export default function StudentActionPlan({ data }: Student360SectionProps) {
  return (
    <div className="relative mt-6 border-t border-card-border pt-5" aria-label="Việc cần chuẩn bị trước khi liên hệ">
      <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-sm font-semibold text-text-primary">Chuẩn bị liên hệ</p><p className="mt-1 text-xs text-text-secondary">Thông tin cần có trước cuộc gọi.</p></div><span className="text-xs font-medium text-primary-500">Trong 48 giờ</span></div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2"><PrepItem icon={<Envelope1 size={15} aria-hidden="true" />} title="Nội dung cần chuẩn bị" detail="Học phí & học bổng" tone="warning" /><PrepItem icon={<Phone size={15} aria-hidden="true" />} title="Người đồng quyết định" detail={`${data.parentProfile.relation} · ${data.parentProfile.preferredChannel} · ${data.parentProfile.bestContactTime}`} tone="primary" /></div>
    </div>
  );
}

function PrepItem({ icon, title, detail, tone }: { icon: React.ReactNode; title: string; detail: string; tone: "warning" | "primary" }) {
  return <div className="flex min-w-0 items-center gap-2.5 rounded-lg border border-card-border bg-card-background p-2.5"><span className={`flex size-7 shrink-0 items-center justify-center rounded-full ${tone === "warning" ? "bg-badge-warning-background text-warning-500" : "bg-badge-primary-background text-primary-500"}`}>{icon}</span><div className="min-w-0"><p className="truncate text-xs font-semibold text-text-primary">{title}</p><p className="mt-0.5 truncate text-[11px] text-text-tertiary">{detail}</p></div></div>;
}
