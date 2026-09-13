import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Lịch sử phân công",
  description: "Xem toàn bộ hồ sơ Lead, trạng thái xử lý và kết quả phân công.",
};

export default function LeadSaleAssignmentHistoryPage() {
  redirect("/lead-sale/student-assignment?tab=history");
}
