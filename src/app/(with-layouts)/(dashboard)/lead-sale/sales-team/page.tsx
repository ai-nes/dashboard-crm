import type { Metadata } from "next";

import SalesTeamWorkspace from "./_components/sales-team-workspace";

export const metadata: Metadata = {
  title: "Đội ngũ Sale",
  description:
    "Theo dõi số lượng học sinh đang phụ trách, hiệu suất và trạng thái làm việc của đội ngũ Sale.",
};

export default function LeadSaleSalesTeamPage() {
  return <SalesTeamWorkspace />;
}
