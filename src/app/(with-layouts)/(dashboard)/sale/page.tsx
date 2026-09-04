import type { Metadata } from "next";

import SaleDashboard from "./_components/sale-dashboard";

export const metadata: Metadata = {
  title: "Sale · Tổng quan",
  description: "Theo dõi luồng tuyển sinh, công việc ưu tiên và hồ sơ cần xử lý của nhân viên Sale.",
};

export default function SalePage() {
  return <SaleDashboard />;
}
