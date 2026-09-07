import type { Metadata } from "next";

import LeadsOverviewDashboard from "@/app/(with-layouts)/(dashboard)/director/leads/_components/leads-overview-dashboard";

export const metadata: Metadata = {
  title: "Danh sách lead",
  description: "Toàn cảnh lead tiếp nhận trước khi được phân công cho đội ngũ sale.",
};

export default function LeadSaleLeadsPage() {
  return <LeadsOverviewDashboard />;
}
