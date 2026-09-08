import type { Metadata } from "next";

import LeadsOverviewDashboard from "@/app/(with-layouts)/(dashboard)/director/leads/_components/leads-overview-dashboard";

export const metadata: Metadata = {
  title: "Danh sách lead",
  description: "Danh sách lead trong phạm vi Sale phụ trách.",
};

export default function SaleLeadsPage() {
  return <LeadsOverviewDashboard />;
}
