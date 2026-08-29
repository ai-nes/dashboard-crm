import type { Metadata } from "next";

import RegionalPerformanceDashboard from "./_components/regional-performance-dashboard";

export const metadata: Metadata = {
  title: "Hiệu suất khu vực",
  description: "Scorecard và phân tích năng lực đội ngũ tuyển sinh theo khu vực.",
};

export default function RegionalPerformancePage() {
  return <RegionalPerformanceDashboard />;
}
