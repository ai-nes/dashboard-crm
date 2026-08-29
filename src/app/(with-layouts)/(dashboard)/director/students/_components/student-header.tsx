import { Envelope1, MapMarker5, Phone } from "@tailgrids/icons";

import { Avatar, AvatarBadge, AvatarFallback } from "@/components/tailgrids/core/avatar";
import { Badge } from "@/components/tailgrids/core/badge";

import type { Student360SectionProps } from "./types";

export default function StudentHeader({ data }: Student360SectionProps) {
  const { student } = data;
  return (
    <header className="rounded-xl border border-card-border bg-card-background p-5 lg:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <Avatar size="xxl"><AvatarFallback>{student.initials}</AvatarFallback><AvatarBadge size="xxl" status="online" /></Avatar>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2"><h1 className="text-balance text-[28px] leading-8 font-semibold tracking-[-0.4px] text-text-primary">{student.name}</h1><Badge color="success">High intent</Badge></div>
            <p className="mt-1 text-sm text-text-tertiary">{student.code} · {student.grade} · {student.major}</p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-text-secondary">
              <span className="flex items-center gap-1.5"><Phone size={15} className="text-icon-tertiary" aria-hidden="true" />{student.phone}</span>
              <span className="flex items-center gap-1.5"><Envelope1 size={15} className="text-icon-tertiary" aria-hidden="true" />{student.email}</span>
            </div>
          </div>
        </div>
        <div className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 xl:min-w-95 xl:grid-cols-1">
          <div><p className="text-xs text-text-tertiary">Trường THPT</p><p className="mt-1 font-medium text-text-primary">{student.school}</p></div>
          <div className="flex items-start gap-1.5"><MapMarker5 size={16} className="mt-0.5 text-icon-tertiary" aria-hidden="true" /><div><p className="text-xs text-text-tertiary">Khu vực</p><p className="mt-1 font-medium text-text-primary">{student.province}</p></div></div>
        </div>
      </div>
    </header>
  );
}
