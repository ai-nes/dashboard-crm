import type { Metadata } from "next";

import LeadsOverviewDashboard from "./_components/leads-overview-dashboard";

export const metadata: Metadata = {
  title: "Quản lý lead",
  description: "Toàn bộ lead trên hệ thống dành cho Director.",
};

export default function DirectorLeadsPage() {
  return <LeadsOverviewDashboard admissionYear={null} />;
}
