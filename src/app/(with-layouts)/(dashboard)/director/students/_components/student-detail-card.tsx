import { CheckCircle1, FileText, Sparkle, UserCircle1 } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card } from "@/components/tailgrids/core/card";

import type { Student360SectionProps } from "./types";

interface InfoGridProps {
  items: { label: string; value: string }[];
}

function InfoGrid({ items }: InfoGridProps) {
  return <dl className="grid gap-x-5 gap-y-4 sm:grid-cols-2">{items.map((item) => <div key={item.label} className="min-w-0"><dt className="text-xs font-medium text-text-tertiary">{item.label}</dt><dd className="mt-1 truncate text-sm font-semibold text-text-primary" title={item.value || "-"}>{item.value || "-"}</dd></div>)}</dl>;
}

export default function StudentDetailCard({ data }: Student360SectionProps) {
  return <Card className="min-w-0 overflow-hidden p-0"><div className="border-b border-card-border bg-background-soft-50 p-5"><div className="flex items-start justify-between gap-3"><div className="flex items-start gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-badge-primary-background text-badge-primary-text" aria-hidden="true"><UserCircle1 size={18} /></span><div><h2 className="text-base leading-6 font-semibold text-text-primary">Thông tin hồ sơ</h2><p className="mt-1 text-xs leading-5 text-text-secondary">Nền tảng cá nhân và học tập để chuẩn bị tư vấn.</p></div></div><Badge color="success"><CheckCircle1 size={13} />Đã xác thực</Badge></div></div><div className="space-y-5 p-5"><section aria-labelledby="student-personal-info"><div className="mb-3 flex items-center gap-2"><span className="size-1.5 rounded-full bg-primary-500" aria-hidden="true" /><h3 id="student-personal-info" className="text-xs font-semibold tracking-wide text-text-secondary uppercase">Thông tin cá nhân</h3></div><InfoGrid items={data.profile} /></section><section aria-labelledby="student-academic-info" className="border-t border-card-border pt-5"><div className="mb-3 flex items-center gap-2"><span className="flex size-5 items-center justify-center rounded-md bg-badge-primary-background text-badge-primary-text" aria-hidden="true"><FileText size={12} /></span><h3 id="student-academic-info" className="text-xs font-semibold tracking-wide text-text-secondary uppercase">Học tập & sở thích</h3></div><InfoGrid items={data.academics} /></section><div className="flex items-start gap-2.5 rounded-lg border border-primary-200 bg-badge-primary-background p-3"><Sparkle size={16} className="mt-0.5 shrink-0 text-badge-primary-text" aria-hidden="true" /><div><p className="text-xs font-semibold text-badge-primary-text">Gợi ý tư vấn</p><p className="mt-1 text-xs leading-5 text-text-secondary">Nhấn mạnh dự án thực tế, học bổng và lộ trình nghề nghiệp ngành {data.student.major}.</p></div></div></div></Card>;
}
