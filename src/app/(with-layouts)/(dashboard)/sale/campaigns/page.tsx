import type { Metadata } from "next";

import CampaignsOverviewDashboard from "@/app/(with-layouts)/(dashboard)/director/campaigns/_components/campaigns-overview-dashboard";

export const metadata: Metadata = {
  title: "Chiến dịch tuyển sinh",
  description: "Theo dõi các chiến dịch tuyển sinh trong workspace Sale.",
};

export default function SaleCampaignsPage() {
  return <CampaignsOverviewDashboard />;
}
