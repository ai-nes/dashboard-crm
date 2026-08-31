import type { Metadata } from "next";

import DemographicExplorerDashboard from "./_components/demographic-explorer-dashboard";

export const metadata: Metadata = {
  title: "Phân tích nhóm lead",
  description: "Theo dõi nguồn, chất lượng lead và nhóm cần ưu tiên trong mùa tuyển sinh.",
};

export default function DemographicsPage() {
  return <DemographicExplorerDashboard />;
}
