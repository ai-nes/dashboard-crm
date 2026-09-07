import type { Metadata } from "next";

import AssignmentHistoryWorkspace from "./_components/assignment-history-workspace";

export const metadata: Metadata = {
  title: "Lịch sử phân công",
  description: "Xem kết quả và lý do phân công của từng học sinh.",
};

export default function LeadSaleAssignmentHistoryPage() {
  return <AssignmentHistoryWorkspace />;
}
