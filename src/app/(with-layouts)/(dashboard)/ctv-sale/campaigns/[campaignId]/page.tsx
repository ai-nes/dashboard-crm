import type { Metadata } from "next";

import CampaignDetailDashboard from "@/app/(with-layouts)/(dashboard)/director/campaigns/_components/campaign-detail-dashboard";

export const metadata: Metadata = {
  title: "Chi tiết chiến dịch",
  description: "Thông tin và danh sách lead của chiến dịch tuyển sinh.",
};

export default async function CtvSaleCampaignDetailPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = await params;
  return <CampaignDetailDashboard key={campaignId} campaignCode={campaignId} />;
}
