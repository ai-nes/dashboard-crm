import type { Metadata } from "next";

import ResultsDashboard from "./_components/results-dashboard";

export const metadata: Metadata = {
  title: "CTV Sale · Kết quả",
  description: "Theo dõi kết quả tư vấn, tỷ lệ chuyển đổi và hiệu suất xử lý của CTV Sale.",
};

export default function CtvSaleResultsPage() {
  return <ResultsDashboard />;
}
