import type { Metadata } from "next";

import CtvSaleDashboard from "./_components/ctv-sale-dashboard";

export const metadata: Metadata = {
  title: "CTV Sale · Tổng quan",
  description: "Theo dõi hồ sơ, việc cần làm và hiệu quả liên hệ của cộng tác viên Sale.",
};

export default function CtvSalePage() {
  return <CtvSaleDashboard />;
}
