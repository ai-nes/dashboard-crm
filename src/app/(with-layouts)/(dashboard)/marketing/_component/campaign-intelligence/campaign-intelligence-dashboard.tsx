"use client";

import { Button } from "@/components/tailgrids/core/button";
import { Skeleton } from "@/components/tailgrids/core/skeleton";
import { useState } from "react";
import { useCampaignIntelligenceQuery } from "@/hooks/use-campaign-intelligence-queries";
import { CampaignFunnel } from "./campaign-funnel";
import { CampaignHeader } from "./campaign-header";
import { CampaignTable } from "./campaign-table";
import { ChannelMix } from "./channel-mix";
import { KpiStrip } from "./kpi-strip";
import { PerformanceTrend } from "./performance-trend";
import { RecommendationBanner } from "./recommendation-banner";
import { LeadOverviewByCampaign } from "./lead-overview-by-campaign";
import { LeadOverviewLeadsDialog } from "./lead-overview-leads-dialog";
import type { CampaignLeadSelection } from "./lead-overview-model";

function DashboardSkeleton({ leadOnly = false }: { leadOnly?: boolean }) {
  return (
    <div className="space-y-5">
      <Skeleton className="h-28 rounded-xl" />
      {leadOnly ? (
        <>
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </>
      ) : (
        <>
          <Skeleton className="h-24 rounded-xl" />
          <div className="grid gap-5 lg:grid-cols-12">
            <Skeleton className="h-84 rounded-xl lg:col-span-7" />
            <Skeleton className="h-84 rounded-xl lg:col-span-5" />
          </div>
          <div className="grid gap-5 lg:grid-cols-12">
            <Skeleton className="h-96 rounded-xl lg:col-span-7 xl:col-span-8" />
            <Skeleton className="h-96 rounded-xl lg:col-span-5 xl:col-span-4" />
          </div>
        </>
      )}
    </div>
  );
}

export default function CampaignIntelligenceDashboard({
  showLeadOverview = false,
}: {
  showLeadOverview?: boolean;
}) {
  const [selection, setSelection] = useState<CampaignLeadSelection | null>(null);
  const { data, isLoading, isError, refetch } = useCampaignIntelligenceQuery();

  if (isLoading) return <DashboardSkeleton leadOnly={showLeadOverview} />;
  if (isError || !data) {
    return (
      <section className="rounded-xl border border-card-border bg-card-background px-6 py-12 text-center">
        <h2 className="text-lg font-semibold text-text-primary">
          Không thể tải dữ liệu chiến dịch
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
          {showLeadOverview
            ? "Hãy thử lại để cập nhật danh sách Lead và trạng thái xử lý theo campaign."
            : "Hãy thử lại để cập nhật dữ liệu chiến dịch và các chỉ số đã đối soát."}
        </p>
        <Button className="mx-auto mt-5" onPress={() => refetch()}>
          Thử lại
        </Button>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <CampaignHeader generatedAt={data.generatedAt} compact={showLeadOverview} />
      {showLeadOverview ? (
        <>
          <LeadOverviewByCampaign
            campaigns={data.campaigns}
            onSelect={setSelection}
            onRetry={() => void refetch()}
          />
          <CampaignTable
            campaigns={data.campaigns}
            onSelect={setSelection}
            leadOnly
          />
        </>
      ) : (
        <>
          {/* Legacy Marketing layout */}
          <RecommendationBanner recommendation={data.recommendation} />
          <KpiStrip summary={data.summary} />
          <div className="grid gap-5 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <PerformanceTrend trend={data.trend} />
            </div>
            <div className="lg:col-span-5">
              <CampaignFunnel funnel={data.funnel} />
            </div>
          </div>
          <div className="grid gap-5 lg:grid-cols-12">
            <div className="lg:col-span-7 xl:col-span-8">
              <CampaignTable campaigns={data.campaigns} />
            </div>
            <div className="lg:col-span-5 xl:col-span-4">
              <ChannelMix campaigns={data.campaigns} />
            </div>
          </div>
          <p className="px-1 text-xs leading-5 text-text-tertiary">
            Số liệu theo phạm vi hiện tại. Doanh thu xác nhận lấy từ hồ sơ nhập học
            và khoản thu đã đối soát trong CRM.
          </p>
        </>
      )}
      {selection && (
        <LeadOverviewLeadsDialog
          key={`${selection.campaign.id}:${selection.statusGroup ?? "all"}`}
          selection={selection}
          onClose={() => setSelection(null)}
        />
      )}
    </div>
  );
}
