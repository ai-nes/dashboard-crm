import type { Metadata } from "next";

import SegmentManagementPage from "@/app/(with-layouts)/(dashboard)/sale/next-best-action/_components/segment-management-page";

export const metadata: Metadata = {
  title: "Quản lý segments",
  description: "Quản lý segments dùng chung cho toàn bộ đội tuyển sinh.",
};

export default function AdminSegmentsPage() {
  return (
    <SegmentManagementPage createHref="/director/admin/segments/create" />
  );
}
