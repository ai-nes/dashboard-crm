import Link from "next/link";

import LeadContactLogCell from "@/app/(with-layouts)/(dashboard)/director/leads/_components/lead-contact-log-cell";
import LeadResultCell from "@/app/(with-layouts)/(dashboard)/director/leads/_components/lead-result-cell";
import {
  leadStageStatusLabel,
  leadStageStatusOptions,
  leadStageTriggerClass,
  type LeadResultStatus,
  type LeadStageStatus,
} from "@/app/(with-layouts)/(dashboard)/director/leads/_components/lead-status";
import { leadTableGrid } from "@/app/(with-layouts)/(dashboard)/director/leads/_components/lead-table-grid";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import { formatDate } from "@/utils/format-date";

import type { CampaignLeadRow } from "./campaign-detail-leads";

export const campaignLeadListGrid = leadTableGrid;

interface CampaignDetailLeadListProps {
  leads: CampaignLeadRow[];
  onStatusChange: (id: string, status: LeadStageStatus) => void;
  onResultChange: (id: string, result: LeadResultStatus) => void;
}

export default function CampaignDetailLeadList({
  leads,
  onStatusChange,
  onResultChange,
}: CampaignDetailLeadListProps) {
  if (leads.length === 0) {
    return (
      <div className="px-5 py-14 text-center">
        <p className="font-medium text-text-primary">Chưa có lead nào cho chiến dịch này</p>
        <p className="mt-1 text-sm text-text-tertiary">Lead phát sinh từ chiến dịch sẽ hiển thị tại đây.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-card-border" aria-label="Danh sách lead theo chiến dịch">
      {leads.map((lead) => (
        <li key={lead.id}>
          <div className={`grid gap-4 px-4 py-4 ${campaignLeadListGrid} lg:items-center lg:px-5`}>
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-badge-primary-background text-sm font-semibold text-badge-primary-text">
                {lead.initials}
              </span>
              <div className="min-w-0">
                <Link
                  href={`/director/leads/${lead.id}`}
                  className="block truncate font-semibold text-text-primary underline-offset-4 hover:text-primary-600 hover:underline"
                >
                  {lead.name}
                </Link>
                <p className="mt-0.5 truncate text-xs text-text-tertiary" title={lead.school}>
                  {lead.school}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 lg:block">
              <p className="text-xs text-text-tertiary lg:hidden">Di động</p>
              <p className="truncate text-sm text-text-primary tabular-nums">{lead.phone}</p>
            </div>

            <div className="flex items-center justify-between gap-2 lg:block">
              <p className="text-xs text-text-tertiary lg:hidden">Nguồn</p>
              <p className="truncate text-sm text-text-primary">{lead.source}</p>
            </div>

            <div className="min-w-0">
              <p className="mb-1 text-xs text-text-tertiary lg:hidden">Người phụ trách</p>
              <p className="truncate text-sm text-text-primary">{lead.owner}</p>
            </div>

            <div className="flex items-center justify-between gap-2 lg:justify-start">
              <p className="text-xs text-text-tertiary lg:hidden">Trạng thái lead</p>
              {lead.status ? (
                <Select
                  value={lead.status}
                  onChange={(value) => onStatusChange(lead.id, String(value) as LeadStageStatus)}
                  aria-label={`Trạng thái lead ${lead.name}`}
                  isDisabled
                  className="w-fit min-w-32"
                >
                  <SelectTrigger
                    size="sm"
                    isDisabled
                    className={`w-full ${leadStageTriggerClass[lead.status]}`}
                  >
                    <SelectValue />
                    <SelectIndicator />
                  </SelectTrigger>
                  <SelectContent>
                    {leadStageStatusOptions.map((status) => (
                      <SelectItem key={status} id={status} textValue={leadStageStatusLabel[status]}>
                        {leadStageStatusLabel[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <span className="text-sm text-text-tertiary">Chưa cập nhật</span>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 lg:justify-start">
              <p className="text-xs text-text-tertiary lg:hidden">Kết quả</p>
              <LeadResultCell
                leadName={lead.name}
                status={lead.processingStatus}
                result={lead.result}
                onChange={(result) => onResultChange(lead.id, result)}
              />
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
              <p className="truncate text-sm text-text-secondary tabular-nums">{formatDate(lead.createdAt)}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
