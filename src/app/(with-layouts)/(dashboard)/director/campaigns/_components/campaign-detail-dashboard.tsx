"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/tailgrids/core/card";
import { useAuth } from "@/components/common/auth/auth-provider";
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
  countCampaignLeadsByStatus,
  filterCampaignLeads,
  toCampaignLeadRow,
  type CampaignLeadStatusFilter,
} from "./campaign-detail-leads";
import CampaignDetailLeadToolbar from "./campaign-detail-lead-toolbar";
import CampaignDetailStats from "./campaign-detail-stats";
import { toCampaignListItem } from "./campaign-mappers";
import { getCampaignListPath } from "./campaign-routes";

export default function CampaignDetailDashboard({
  campaignCode,
}: {
  campaignCode: string;
}) {
  const { user } = useAuth();
  const campaignListPath = getCampaignListPath(user?.roles);
  const campaignQuery = useLeadSaleCampaignQuery(campaignCode);
  const { data: channelTypeData } = useLeadSaleCampaignChannelTypesQuery();
  const campaign = useMemo(
    () => (campaignQuery.data ? toCampaignListItem(campaignQuery.data) : null),
    [campaignQuery.data],
  );
  const leadsQuery = useLeadSaleLeadsQuery(
    { campaign: campaignQuery.data?.name ?? "", page: 1, pageSize: 100 },
    { enabled: Boolean(campaignQuery.data) },
  );
  const fetchedLeads = useMemo(
    () => (leadsQuery.data?.data ?? []).map(toCampaignLeadRow),
    [leadsQuery.data],
  );
  const [leadQuery, setLeadQuery] = useState("");
  const [leadStatus, setLeadStatus] = useState<CampaignLeadStatusFilter>("all");
  const filteredLeads = useMemo(
    () => filterCampaignLeads(fetchedLeads, leadQuery, leadStatus),
    [fetchedLeads, leadQuery, leadStatus],
  );
  const leadStatusCounts = useMemo(
    () => countCampaignLeadsByStatus(fetchedLeads),
    [fetchedLeads],
  );

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
        backHref={campaignListPath}
        campaign={campaign}
        channelTypes={channelTypeData?.channelTypes ?? []}
      />

      <CampaignDetailStats
        leads={fetchedLeads}
        stats={leadsQuery.data?.meta.stats}
      />

      <CampaignDetailLeadToolbar
        query={leadQuery}
        status={leadStatus}
        counts={leadStatusCounts}
        onQueryChange={setLeadQuery}
        onStatusChange={setLeadStatus}
      />

      <Card className="overflow-hidden p-0">
        {leadsQuery.isPending ? (
          <div className="px-5 py-14 text-center text-sm text-text-tertiary">
            Đang tải danh sách lead...
          </div>
        ) : leadsQuery.isError ? (
          <div className="px-5 py-14 text-center text-sm text-badge-error-text">
            {leadsQuery.error.message}
          </div>
        ) : (
          <div>
            <div
              className={`hidden ${campaignLeadListGrid} items-center gap-4 border-b border-card-border bg-background-soft-50 px-5 py-3 text-xs font-medium text-text-tertiary lg:grid`}
              aria-hidden="true"
            >
              <span className="min-w-0 truncate">Mã Lead</span>
              <span className="min-w-0 truncate">Họ và Tên</span>
              <span className="min-w-0 truncate">Di động</span>
              <span className="min-w-0 truncate">Nguồn</span>
              <span className="min-w-0 truncate">Trạng thái lead</span>
              <span className="min-w-0 truncate">Kết quả</span>
              <span className="min-w-0 truncate">Người phụ trách</span>
              <span className="min-w-0 truncate">Ngày tạo</span>
            </div>
            <CampaignDetailLeadList
              leads={filteredLeads}
              isFiltered={Boolean(leadQuery.trim()) || leadStatus !== "all"}
            />
          </div>
        )}
      </Card>
    </main>
  );
}
