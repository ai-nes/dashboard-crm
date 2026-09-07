import type { Metadata } from "next";

import AssignmentHistoryWorkspace from "./_components/assignment-history-workspace";

export const metadata: Metadata = {
  title: "Lịch sử đợt phân công",
  description: "Xem các đợt Lead, trạng thái xử lý và kết quả phân công.",
};

export default function LeadSaleAssignmentHistoryPage() {
  return <AssignmentHistoryWorkspace />;
}
