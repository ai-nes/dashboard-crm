import type { Metadata } from "next";

import NbaActionsAdminPage from "./_components/nba-actions-admin-page";

export const metadata: Metadata = {
  title: "Cấu hình Action NBA",
  description:
    "Quản lý các khung giờ mà hệ thống được phép đề xuất Action NBA.",
};

export default function NbaActionsPage() {
  return <NbaActionsAdminPage />;
}
