import type { Metadata } from "next";

import LeadSaleDashboard from "./_components/lead-sale-dashboard";

export const metadata: Metadata = {
  title: "Lead Sale · Tổng quan",
  description: "Theo dõi phân công, điểm cần can thiệp và kết quả của đội ngũ Sale.",
};

export default function LeadSalePage() {
  return <LeadSaleDashboard />;
}
