import Link from "next/link";

import { Badge } from "@/components/tailgrids/core/badge";
import { formatDate } from "@/utils/format-date";
import { getBusinessRouteKey } from "@/utils/business-record-route";

import LeadResultCell from "./lead-result-cell";
import LeadListAssigneeCell from "./lead-list-assignee-cell";
import LeadRowActions from "./lead-row-actions";
import {
  leadStageStatusColor,
  leadStageStatusLabel,
  normalizeLeadStageStatus,
} from "./lead-status";
import { leadTableActionsGrid } from "./lead-table-grid";
import type { LeadListItem } from "./types";

export const leadListGrid = leadTableActionsGrid;

export function getLeadDetailHref(leadId: string, leadCode?: string | null) {
  return `/director/leads/${encodeURIComponent(getBusinessRouteKey(leadCode, leadId))}`;
}

interface LeadListProps {
  leads: LeadListItem[];
  canAssign?: boolean;
  canEditLead?: (lead: LeadListItem) => boolean;
  canDeleteLead?: (lead: LeadListItem) => boolean;
  onDeleteRequest?: (lead: LeadListItem) => void;
  isDeleting?: boolean;
}

export default function LeadList({
  leads,
  canAssign = false,
  canEditLead,
  canDeleteLead,
  onDeleteRequest,
  isDeleting = false,
}: LeadListProps) {
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
              <div className="flex min-w-0 items-center justify-between gap-2 lg:block">
                <p className="text-xs text-text-tertiary lg:hidden">Mã Lead</p>
                <p className="truncate text-sm font-medium text-text-primary">
                  {lead.leadCode || "-"}
                </p>
              </div>

              <div className="min-w-0">
                <Link
                  href={getLeadDetailHref(lead.id, lead.leadCode)}
                  className="block truncate font-semibold text-text-primary underline-offset-4 hover:text-primary-600 hover:underline"
                >
                  {lead.name || "-"}
                </Link>
                <p
                  className="mt-0.5 truncate text-xs text-text-tertiary"
                  title={lead.school || undefined}
                >
                  {lead.school || "-"}
                </p>
              </div>

              <div className="flex min-w-0 items-center justify-between gap-2 lg:block">
                <p className="text-xs text-text-tertiary lg:hidden">Di động</p>
                <p className="truncate text-sm text-text-primary tabular-nums">
                  {lead.phone || "-"}
                </p>
              </div>

              <div className="flex min-w-0 items-center justify-between gap-2 lg:block">
                <p className="text-xs text-text-tertiary lg:hidden">Nguồn</p>
                <p className="truncate text-sm text-text-primary">
                  {lead.source || "-"}
                </p>
              </div>

              <div className="flex min-w-0 items-center justify-between gap-2 lg:justify-start">
                <p className="text-xs text-text-tertiary lg:hidden">
                  Trạng thái lead
                </p>
                {status ? (
                  <Badge
                    color={leadStageStatusColor[status]}
                    size="md"
                    className="whitespace-nowrap"
                  >
                    {leadStageStatusLabel[status]}
                  </Badge>
                ) : (
                  <span className="text-sm text-text-tertiary">
                    Chưa cập nhật
                  </span>
                )}
              </div>

              <div className="flex min-w-0 items-center justify-between gap-2 lg:justify-start">
                <p className="text-xs text-text-tertiary lg:hidden">Kết quả</p>
                <LeadResultCell result={lead.result} />
              </div>

              <div className="min-w-0">
                <p className="mb-1 text-xs text-text-tertiary lg:hidden">
                  Người phụ trách
                </p>
                <LeadListAssigneeCell canAssign={canAssign} lead={lead} />
              </div>

              <div className="flex min-w-0 items-center justify-between gap-2 lg:block">
                <p className="text-xs text-text-tertiary lg:hidden">Ngày tạo</p>
                <p className="truncate text-sm text-text-secondary tabular-nums">
                  {formatDate(lead.createdAt ?? "")}
                </p>
              </div>
              <div className="flex items-center justify-end">
                <LeadRowActions
                  label={lead.leadCode || lead.name}
                  detailHref={getLeadDetailHref(lead.id, lead.leadCode)}
                  canEdit={canEditLead?.(lead) ?? false}
                  onDelete={
                    onDeleteRequest && canDeleteLead?.(lead)
                      ? () => onDeleteRequest(lead)
                      : undefined
                  }
                  isDeleting={isDeleting}
                />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
