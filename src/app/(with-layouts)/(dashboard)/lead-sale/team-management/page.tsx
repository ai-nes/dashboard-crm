import type { Metadata } from "next";

import BigTeamOverviewDashboard from "./_components/big-team-overview-dashboard";

export const metadata: Metadata = {
  title: "Quản lý Team",
  description: "Cơ cấu team lớn và team nhỏ của đội ngũ Sale.",
};

export default function TeamManagementPage() {
  return <BigTeamOverviewDashboard />;
}
