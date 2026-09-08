import type { Metadata } from "next";

import LeadsOverviewDashboard from "@/app/(with-layouts)/(dashboard)/director/leads/_components/leads-overview-dashboard";

export const metadata: Metadata = {
  title: "Danh sách lead",
  description: "Danh sách lead được phân công cho CTV Sale.",
};

export default function CtvSaleLeadsPage() {
  return <LeadsOverviewDashboard />;
}
