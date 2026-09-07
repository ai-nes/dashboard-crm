import type { Metadata } from "next";

import CampaignsOverviewDashboard from "@/app/(with-layouts)/(dashboard)/director/campaigns/_components/campaigns-overview-dashboard";

export const metadata: Metadata = {
  title: "Chiến dịch tuyển sinh",
  description: "Theo dõi các kỳ tuyển sinh, thời gian mở/đóng và trạng thái vận hành.",
};

export default function LeadSaleCampaignsPage() {
  return <CampaignsOverviewDashboard />;
}
