"use client";

import { useMemo, useState } from "react";

import type {
  LeadResultStatus,
  LeadStageStatus,
} from "@/app/(with-layouts)/(dashboard)/director/leads/_components/lead-status";
import { Card } from "@/components/tailgrids/core/card";
import {
  useLeadSaleCampaignChannelTypesQuery,
  useLeadSaleCampaignQuery,
} from "@/hooks/use-lead-sale-campaign-queries";
import { useLeadSaleLeadsQuery } from "@/hooks/use-lead-sale-leads-queries";

import CampaignDetailHeader from "./campaign-detail-header";
import CampaignDetailLeadList, {
  campaignLeadListGrid,
} from "./campaign-detail-lead-list";
import {
  toCampaignLeadRow,
  type CampaignLeadRow,
} from "./campaign-detail-leads";
import CampaignDetailStats from "./campaign-detail-stats";
import { toCampaignListItem } from "./campaign-mappers";

export default function CampaignDetailDashboard({
  campaignId,
}: {
  campaignId: string;
}) {
  const campaignQuery = useLeadSaleCampaignQuery(campaignId);
  const { data: channelTypeData } = useLeadSaleCampaignChannelTypesQuery();
  const campaign = useMemo(
    () => (campaignQuery.data ? toCampaignListItem(campaignQuery.data) : null),
    [campaignQuery.data],
  );
  const leadsQuery = useLeadSaleLeadsQuery(
    { campaign: campaignId, page: 1, pageSize: 100 },
    { enabled: Boolean(campaignQuery.data) },
  );
  const fetchedLeads = useMemo(
    () => (leadsQuery.data?.data ?? []).map(toCampaignLeadRow),
    [leadsQuery.data],
  );
  const [leadOverrides, setLeadOverrides] = useState<
    Record<string, Partial<CampaignLeadRow>>
  >({});
  const leads = useMemo(
    () => fetchedLeads.map((lead) => ({ ...lead, ...leadOverrides[lead.id] })),
    [fetchedLeads, leadOverrides],
  );

  const handleStatusChange = (id: string, status: LeadStageStatus) => {
    const currentResult = leads.find((lead) => lead.id === id)?.result ?? "";
    setLeadOverrides((current) => ({
      ...current,
      [id]: {
        ...current[id],
        status,
        result:
          status === "ASSIGNED" || status === "CLOSED" ? currentResult : "",
      },
    }));
  };

  const handleResultChange = (id: string, result: LeadResultStatus) => {
    setLeadOverrides((current) => ({
      ...current,
      [id]: { ...current[id], result },
    }));
  };

  if (campaignQuery.isPending) {
    return (
      <main id="main-content" className="min-w-0 p-6">
        <Card className="p-5 text-sm text-text-secondary">
          Đang tải chi tiết chiến dịch...
        </Card>
      </main>
    );
  }

  if (campaignQuery.isError) {
    return (
      <main id="main-content" className="min-w-0 p-6">
        <Card className="border-error-200 bg-badge-error-background p-5 text-error-600">
          <p className="text-base font-semibold">Không thể tải chiến dịch.</p>
          <p className="mt-1 text-sm">{campaignQuery.error.message}</p>
        </Card>
      </main>
    );
  }

  if (!campaign) {
    return (
      <main id="main-content" className="min-w-0 p-6">
        <Card className="border-error-200 bg-badge-error-background p-5 text-error-600">
          <p className="text-base font-semibold">
            Không tìm thấy chiến dịch này.
          </p>
          <p className="mt-1 text-sm">
            Chiến dịch có thể đã bị xóa hoặc mã chiến dịch không đúng.
          </p>
        </Card>
      </main>
    );
  }

  return (
    <main
      id="main-content"
      className="min-w-0 space-y-5 px-2 py-4 pb-8 lg:px-6"
    >
      <CampaignDetailHeader
        campaign={campaign}
        channelTypes={channelTypeData?.channelTypes ?? []}
      />

      <CampaignDetailStats leads={leads} stats={leadsQuery.data?.meta.stats} />

      <Card className="overflow-hidden p-0">
        <div className="border-b border-card-border px-4 py-3.5 sm:px-5">
          <h2 className="text-sm font-semibold text-text-primary">
            Danh sách lead theo chiến dịch
          </h2>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">
            Danh sách lead được tải từ CRM.
          </p>
        </div>
        {leadsQuery.isPending ? (
          <div className="px-5 py-14 text-center text-sm text-text-tertiary">
            Đang tải danh sách lead...
          </div>
        ) : leadsQuery.isError ? (
          <div className="px-5 py-14 text-center text-sm text-badge-error-text">
            {leadsQuery.error.message}
          </div>
        ) : (
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
        )}
      </Card>
    </main>
  );
}
