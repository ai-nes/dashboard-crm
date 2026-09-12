import type { Metadata } from "next";

import SegmentManagementPage from "@/app/(with-layouts)/(dashboard)/sale/next-best-action/_components/segment-management-page";

export const metadata: Metadata = {
  title: "Segments học sinh",
  description: "Các segment có học sinh trong phạm vi hiển thị của CTV Sale.",
};

export default function CtvSaleSegmentsPage() {
  return <SegmentManagementPage />;
}
