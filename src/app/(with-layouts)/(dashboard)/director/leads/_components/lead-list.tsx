import Link from "next/link";

import { Badge } from "@/components/tailgrids/core/badge";

import { leadStatusColor } from "./mappings";
import type { LeadListItem } from "./types";

interface LeadListProps {
  leads: LeadListItem[];
}

export const leadListGrid =
  "lg:grid-cols-[minmax(200px,1.3fr)_140px_minmax(170px,1.1fr)_170px_150px_minmax(160px,1fr)_110px]";

export default function LeadList({ leads }: LeadListProps) {
  if (leads.length === 0) {
    return (
      <div className="px-5 py-14 text-center">
        <p className="font-medium text-text-primary">Không tìm thấy lead phù hợp</p>
        <p className="mt-1 text-sm text-text-tertiary">Thử thay đổi từ khóa hoặc bộ lọc để xem thêm lead.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-card-border" aria-label="Danh sách lead">
      {leads.map((lead) => (
        <li key={lead.id}>
          <div className={`grid gap-4 px-4 py-4 ${leadListGrid} lg:items-center lg:px-5`}>
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-badge-primary-background text-sm font-semibold text-badge-primary-text">
                {lead.initials || "L"}
              </span>
              <p className="truncate font-semibold text-text-primary">{lead.name || "-"}</p>
            </div>

            <div className="flex items-center justify-between gap-2 lg:block">
              <p className="text-xs text-text-tertiary lg:hidden">Di động</p>
              <p className="truncate text-sm text-text-primary tabular-nums">{lead.phone || "-"}</p>
            </div>

            <div className="flex items-center justify-between gap-2 lg:block">
              <p className="text-xs text-text-tertiary lg:hidden">Trường THPT</p>
              <p className="truncate text-sm text-text-primary" title={lead.school || undefined}>{lead.school || "-"}</p>
            </div>

            <div className="flex items-center justify-between gap-2 lg:justify-start">
              <p className="text-xs text-text-tertiary lg:hidden">Tình trạng Lead</p>
              <Badge color={leadStatusColor[lead.status]}>{lead.status}</Badge>
            </div>

            <div className="flex items-center justify-between gap-2 lg:block">
              <p className="text-xs text-text-tertiary lg:hidden">Nguồn</p>
              <p className="truncate text-sm text-text-primary">{lead.source || "-"}</p>
            </div>

            <div className="min-w-0">
              <p className="mb-1 text-xs text-text-tertiary lg:hidden">Người phụ trách</p>
              <p className="truncate text-sm text-text-primary">{lead.owner}</p>
            </div>

            <div className="flex items-center justify-between gap-2 lg:justify-center">
              <p className="text-xs text-text-tertiary lg:hidden">Thao tác</p>
              <Link
                href={`/director/leads/${lead.id}`}
                aria-label={`Xem chi tiết lead ${lead.name || ""}`}
                className="text-xs font-medium text-warning-500 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
              >
                Chi tiết
              </Link>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
