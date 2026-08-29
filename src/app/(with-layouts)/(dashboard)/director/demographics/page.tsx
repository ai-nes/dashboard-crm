import type { Metadata } from "next";

import DemographicExplorerDashboard from "./_components/demographic-explorer-dashboard";

export const metadata: Metadata = {
  title: "Khám phá người học | AI-NES Admission Intelligence",
  description: "Phân tích phân khúc người học và cơ hội tuyển sinh theo thị trường.",
};

export default function DemographicsPage() {
  return <DemographicExplorerDashboard />;
}
