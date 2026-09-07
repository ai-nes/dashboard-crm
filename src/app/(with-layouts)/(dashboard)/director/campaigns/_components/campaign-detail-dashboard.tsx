"use client";

import { useMemo, useState } from "react";

import type {
  LeadResultStatus,
  LeadStageStatus,
} from "@/app/(with-layouts)/(dashboard)/director/leads/_components/lead-status";
import { Card } from "@/components/tailgrids/core/card";
import { useLeadSaleCampaignChannelTypesQuery } from "@/hooks/use-lead-sale-campaign-queries";

import CampaignDetailHeader from "./campaign-detail-header";
import CampaignDetailLeadList, { campaignLeadListGrid } from "./campaign-detail-lead-list";
import { generateCampaignLeads, type CampaignLeadRow } from "./campaign-detail-leads";
import CampaignDetailStats from "./campaign-detail-stats";
import { initialCampaigns } from "./data";

export default function CampaignDetailDashboard({ campaignId }: { campaignId: string }) {
  const { data: channelTypeData } = useLeadSaleCampaignChannelTypesQuery();
  const campaign = useMemo(
    () => initialCampaigns.find((item) => item.id === campaignId) ?? null,
    [campaignId],
  );
  const [leads, setLeads] = useState<CampaignLeadRow[]>(() =>
    campaign ? generateCampaignLeads(campaign.id) : [],
  );

  const handleStatusChange = (id: string, status: LeadStageStatus) => {
    setLeads((current) =>
      current.map((lead) =>
        lead.id === id
          ? {
              ...lead,
              status,
              result: status === "ASSIGNED" || status === "CLOSED" ? lead.result : "",
            }
          : lead,
      ),
    );
  };

  const handleResultChange = (id: string, result: LeadResultStatus) => {
    setLeads((current) => current.map((lead) => (lead.id === id ? { ...lead, result } : lead)));
  };

  if (!campaign) {
    return (
      <main id="main-content" className="min-w-0 p-6">
        <Card className="border-error-200 bg-badge-error-background p-5 text-error-600">
          <p className="text-base font-semibold">Không tìm thấy chiến dịch này.</p>
          <p className="mt-1 text-sm">Chiến dịch có thể đã bị xóa hoặc mã chiến dịch không đúng.</p>
        </Card>
      </main>
    );
  }

  return (
    <main id="main-content" className="min-w-0 space-y-5 px-2 py-4 pb-8 lg:px-6">
      <CampaignDetailHeader campaign={campaign} channelTypes={channelTypeData?.channelTypes ?? []} />

      <CampaignDetailStats leads={leads} />

      <Card className="overflow-hidden p-0">
        <div className="border-b border-card-border px-4 py-3.5 sm:px-5">
          <h2 className="text-sm font-semibold text-text-primary">Danh sách lead theo chiến dịch</h2>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Mockdata — sẽ kết nối dữ liệu thật ở bước sau.</p>
        </div>
        <div className="lg:overflow-x-auto">
          <div className="lg:min-w-[1350px]">
            <div
              className={`hidden ${campaignLeadListGrid} items-center gap-4 border-b border-card-border bg-background-soft-50 px-5 py-3 text-xs font-medium text-text-tertiary lg:grid`}
              aria-hidden="true"
            >
              <span>Họ và Tên</span>
              <span>Di động</span>
              <span>Nguồn</span>
              <span>Người phụ trách</span>
              <span>Trạng thái lead</span>
              <span>Kết quả</span>
              <span>Số lần liên hệ</span>
              <span>Ngày tạo</span>
            </div>
            <CampaignDetailLeadList
              leads={leads}
              onStatusChange={handleStatusChange}
              onResultChange={handleResultChange}
            />
          </div>
        </div>
      </Card>
    </main>
  );
}
