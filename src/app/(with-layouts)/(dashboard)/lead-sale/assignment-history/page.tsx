import type { Metadata } from "next";

import AssignmentHistoryWorkspace from "./_components/assignment-history-workspace";

export const metadata: Metadata = {
  title: "Lịch sử phân công",
  description: "Xem toàn bộ hồ sơ Lead, trạng thái xử lý và kết quả phân công.",
};

export default function LeadSaleAssignmentHistoryPage() {
  return <AssignmentHistoryWorkspace />;
}
