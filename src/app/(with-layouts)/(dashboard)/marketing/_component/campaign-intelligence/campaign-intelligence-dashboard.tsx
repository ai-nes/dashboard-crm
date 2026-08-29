"use client";

import { Button } from "@/components/tailgrids/core/button";
import { Skeleton } from "@/components/tailgrids/core/skeleton";
import { getCampaignIntelligence } from "@/services/api/campaign-intelligence";
import { useQuery } from "@tanstack/react-query";
import { CampaignFunnel } from "./campaign-funnel";
import { CampaignHeader } from "./campaign-header";
import { CampaignTable } from "./campaign-table";
import { ChannelMix } from "./channel-mix";
import { KpiStrip } from "./kpi-strip";
import { PerformanceTrend } from "./performance-trend";
import { RecommendationBanner } from "./recommendation-banner";


function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-28 rounded-xl" />
      <Skeleton className="h-24 rounded-xl" />
      <div className="grid gap-5 lg:grid-cols-12">
        <Skeleton className="h-84 rounded-xl lg:col-span-7" />
        <Skeleton className="h-84 rounded-xl lg:col-span-5" />
      </div>
      <div className="grid gap-5 lg:grid-cols-12">
        <Skeleton className="h-96 rounded-xl lg:col-span-7 xl:col-span-8" />
        <Skeleton className="h-96 rounded-xl lg:col-span-5 xl:col-span-4" />
      </div>
    </div>
  );
}

export default function CampaignIntelligenceDashboard() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["campaign-intelligence"],
    queryFn: getCampaignIntelligence,
  });

  if (isLoading) return <DashboardSkeleton />;
  if (isError || !data) {
    return (
      <section className="rounded-xl border border-card-border bg-card-background px-6 py-12 text-center">
        <h2 className="text-lg font-semibold text-text-primary">Không thể tải dữ liệu campaign</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
          Hãy thử lại để cập nhật attribution và doanh thu xác nhận.
        </p>
        <Button className="mx-auto mt-5" onPress={() => refetch()}>
          Thử lại
        </Button>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <CampaignHeader />
      <RecommendationBanner recommendation={data.recommendation} />
      <KpiStrip summary={data.summary} />

      {/* Row 1: Performance Trend & Funnel */}
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <PerformanceTrend trend={data.trend} />
        </div>
        <div className="lg:col-span-5">
          <CampaignFunnel funnel={data.funnel} />
        </div>
      </div>

      {/* Row 2: Campaign Table & Channel Mix */}
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7 xl:col-span-8">
          <CampaignTable campaigns={data.campaigns} />
        </div>
        <div className="lg:col-span-5 xl:col-span-4">
          <ChannelMix campaigns={data.campaigns} />
        </div>
      </div>

      <p className="px-1 text-xs leading-5 text-text-tertiary">
        Tất cả chỉ số so sánh với kỳ trước. Doanh thu xác nhận được tính từ enrollment đã được đối soát trong CRM.
      </p>
    </div>
  );
}


