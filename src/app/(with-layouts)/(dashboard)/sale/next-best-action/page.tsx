import type { Metadata } from "next";

import SegmentManagementPage from "./_components/segment-management-page";

export const metadata: Metadata = {
  title: "Quản lý segments",
  description: "Không gian quản lý segments sẽ được bổ sung sau.",
};

export default function SaleNextBestActionPage() {
  return <SegmentManagementPage createHref="/sale/segments/create" />;
}
