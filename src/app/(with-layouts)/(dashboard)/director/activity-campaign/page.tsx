import type { Metadata } from "next";
import { ArrowRight } from "@tailgrids/icons";
import Link from "next/link";
import { Card } from "@/components/tailgrids/core/card";
import SchoolFieldActivityPageClient from "../school-field-activity/_components/school-field-activity-page-client";
import CampaignIntelligenceDashboard from "../../marketing/_component/campaign-intelligence/campaign-intelligence-dashboard";
import { MarketingTimeRangeProvider } from "../../marketing/_component/time-range-context";
import ActivityCampaignTabs, { type ActivityCampaignTab } from "./_components/activity-campaign-tabs";

export const metadata: Metadata = { title: "Hoạt động & chiến dịch", description: "Theo dõi triển khai thực địa và hiệu quả chiến dịch tuyển sinh." };

function isTab(value: string | undefined): value is ActivityCampaignTab {
  return value === "field" || value === "campaign";
}

export default async function ActivityCampaignPage({ searchParams }: PageProps<"/director/activity-campaign">) {
  const { tab } = await searchParams;
  const tabValue = typeof tab === "string" ? tab : undefined;
  const activeTab: ActivityCampaignTab = isTab(tabValue) ? tabValue : "field";
  return (
    <main className="min-w-0 space-y-5 px-2 py-4 pb-8 lg:px-6" id="main-content">
      <Card className="flex flex-col gap-5 p-5 lg:flex-row lg:items-end lg:justify-between lg:p-6">
        <div className="min-w-0"><h1 className="text-balance text-[28px] leading-8 font-semibold tracking-[-0.4px] text-text-primary">Hoạt động & chiến dịch</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">Theo dõi triển khai thực địa, hiệu quả chuyển đổi và các ưu tiên cần hành động trong cùng một không gian.</p></div>
        <Link href="/director/ai/next-best-action" className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-button-primary-background px-3 text-sm font-medium text-button-primary-text transition hover:bg-button-primary-hover-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500">Xem việc cần xử lý <ArrowRight size={16} aria-hidden="true" /></Link>
      </Card>
      <ActivityCampaignTabs activeTab={activeTab} />
      {activeTab === "field" ? <SchoolFieldActivityPageClient /> : <MarketingTimeRangeProvider><CampaignIntelligenceDashboard /></MarketingTimeRangeProvider>}
    </main>
  );
}
