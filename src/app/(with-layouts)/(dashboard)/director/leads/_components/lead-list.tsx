import Link from "next/link";

import { Badge } from "@/components/tailgrids/core/badge";
import { formatDate } from "@/utils/format-date";

import LeadContactLogCell from "./lead-contact-log-cell";
import LeadResultCell from "./lead-result-cell";
import {
  leadStageStatusColor,
  leadStageStatusLabel,
  normalizeLeadStageStatus,
} from "./lead-status";
import { leadTableGrid } from "./lead-table-grid";
import type { LeadListItem } from "./types";

export const leadListGrid = leadTableGrid;

export function getLeadDetailHref(leadId: string) {
  return `/director/leads/${leadId}`;
}

interface LeadListProps {
  leads: LeadListItem[];
}

export default function LeadList({ leads }: LeadListProps) {
  if (leads.length === 0) {
    return (
      <div className="px-5 py-14 text-center">
        <p className="font-medium text-text-primary">
          Không tìm thấy lead phù hợp
        </p>
        <p className="mt-1 text-sm text-text-tertiary">
          Thử thay đổi từ khóa hoặc bộ lọc để xem thêm lead.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-card-border" aria-label="Danh sách lead">
      {leads.map((lead) => {
        const status = normalizeLeadStageStatus(
          lead.statusCode ?? lead.status ?? lead.processingStatus,
        );
        return (
          <li key={lead.id}>
            <div
              className={`grid gap-4 px-4 py-4 ${leadListGrid} lg:items-center lg:px-5`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-badge-primary-background text-sm font-semibold text-badge-primary-text">
                  {lead.initials || "L"}
                </span>
                <div className="min-w-0">
                  <Link
                    href={getLeadDetailHref(lead.id)}
                    className="block truncate font-semibold text-text-primary underline-offset-4 hover:text-primary-600 hover:underline"
                  >
                    {lead.name || "-"}
                  </Link>
                  <p className="mt-0.5 truncate text-xs text-text-tertiary" title={lead.school || undefined}>
                    {lead.school || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 lg:block">
                <p className="text-xs text-text-tertiary lg:hidden">Di động</p>
                <p className="truncate text-sm text-text-primary tabular-nums">
                  {lead.phone || "-"}
                </p>
              </div>

              <div className="flex items-center justify-between gap-2 lg:block">
                <p className="text-xs text-text-tertiary lg:hidden">Nguồn</p>
                <p className="truncate text-sm text-text-primary">
                  {lead.source || "-"}
                </p>
              </div>

              <div className="min-w-0">
                <p className="mb-1 text-xs text-text-tertiary lg:hidden">
                  Người phụ trách
                </p>
                <p className="truncate text-sm text-text-primary">{lead.owner}</p>
              </div>

              <div className="flex items-center justify-between gap-2 lg:justify-start">
                <p className="text-xs text-text-tertiary lg:hidden">Trạng thái lead</p>
                {status ? (
                  <Badge
                    color={leadStageStatusColor[status]}
                    size="md"
                    className="whitespace-nowrap"
                  >
                    {leadStageStatusLabel[status]}
                  </Badge>
                ) : (
                  <span className="text-sm text-text-tertiary">Chưa cập nhật</span>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 lg:justify-start">
                <p className="text-xs text-text-tertiary lg:hidden">Kết quả</p>
                <LeadResultCell result={lead.result} />
              </div>

              <div className="flex items-center justify-between gap-2 lg:block">
                <p className="text-xs text-text-tertiary lg:hidden">Số lần liên hệ</p>
                <LeadContactLogCell
                  leadName={lead.name}
                  noAnswer={lead.contactNoAnswer}
                  success={lead.contactSuccess}
                />
              </div>

              <div className="flex items-center justify-between gap-2 lg:block">
                <p className="text-xs text-text-tertiary lg:hidden">Ngày tạo</p>
                <p className="truncate text-sm text-text-secondary tabular-nums">
                  {formatDate(lead.createdAt ?? "")}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
