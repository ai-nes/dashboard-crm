import type { Metadata } from "next";

import SegmentManagementPage from "@/app/(with-layouts)/(dashboard)/sale/next-best-action/_components/segment-management-page";

export const metadata: Metadata = {
  title: "Phân khúc học sinh",
  description: "Quản lý các phân khúc học sinh dùng chung cho đội tuyển sinh.",
};

export default function AdminSegmentsPage() {
  return (
    <SegmentManagementPage
      createHref="/director/admin/segments/create"
      isAdmin
    />
  );
}
