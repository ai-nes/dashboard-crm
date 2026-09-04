import type { Metadata } from "next";

import DemographicExplorerDashboard from "@/app/(with-layouts)/(dashboard)/director/demographics/_components/demographic-explorer-dashboard";

export const metadata: Metadata = {
  title: "Khám phá người học",
  description:
    "Theo dõi nguồn, chất lượng học sinh và nhóm cần ưu tiên trong mùa tuyển sinh.",
};

export default function SaleDemographicsPage() {
  return <DemographicExplorerDashboard />;
}
