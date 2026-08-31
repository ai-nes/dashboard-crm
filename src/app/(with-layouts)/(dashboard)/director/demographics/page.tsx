import type { Metadata } from "next";

import DemographicExplorerDashboard from "./_components/demographic-explorer-dashboard";

export const metadata: Metadata = {
  title: "Tổng quan nhóm học sinh",
  description: "Theo dõi nguồn, chất lượng lead và nhóm cần ưu tiên trong mùa tuyển sinh.",
};

export default function DemographicsPage() {
  return <DemographicExplorerDashboard />;
}
