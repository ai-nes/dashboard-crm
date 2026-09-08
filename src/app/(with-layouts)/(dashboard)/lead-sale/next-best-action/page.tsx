import type { Metadata } from "next";

import SegmentManagementPage from "@/app/(with-layouts)/(dashboard)/sale/next-best-action/_components/segment-management-page";

export const metadata: Metadata = {
  title: "Quản lý segments",
  description: "Không gian quản lý segments sẽ được bổ sung sau.",
};

export default function LeadSaleNextBestActionPage() {
  return <SegmentManagementPage createHref="/lead-sale/segments/create" />;
}
