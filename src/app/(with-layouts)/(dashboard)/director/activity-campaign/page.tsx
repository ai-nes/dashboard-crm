import type { Metadata } from "next";
import ActivityCampaignPageClient from "./_components/activity-campaign-page-client";
import type { ActivityCampaignTab } from "./_components/activity-campaign-tabs";

export const metadata: Metadata = {
  title: "Hoạt động & chiến dịch",
  description:
    "Theo dõi triển khai thực địa và hiệu quả chiến dịch tuyển sinh.",
};

function isTab(value: string | undefined): value is ActivityCampaignTab {
  return value === "field" || value === "campaign";
}

export default async function ActivityCampaignPage({
  searchParams,
}: PageProps<"/director/activity-campaign">) {
  const { tab } = await searchParams;
  const tabValue = typeof tab === "string" ? tab : undefined;
  const activeTab: ActivityCampaignTab = isTab(tabValue) ? tabValue : "field";
  return <ActivityCampaignPageClient requestedTab={activeTab} />;
}
