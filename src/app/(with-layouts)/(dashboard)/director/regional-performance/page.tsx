import type { Metadata } from "next";

import RegionalPerformanceDashboard from "./_components/regional-performance-dashboard";

export const metadata: Metadata = {
  title: "Hiệu suất khu vực",
  description:
    "Theo dõi kết quả tuyển sinh, tải xử lý và nhu cầu hỗ trợ theo từng địa bàn.",
};

export default function RegionalPerformancePage() {
  return <RegionalPerformanceDashboard />;
}
