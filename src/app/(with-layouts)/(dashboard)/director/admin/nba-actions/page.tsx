import type { Metadata } from "next";

import NbaActionsAdminPage from "./_components/nba-actions-admin-page";

export const metadata: Metadata = {
  title: "Quản lý cấu hình NBA",
  description:
    "Quản lý hành động, nhóm hành động, chính sách thời gian và quy tắc đề xuất trong quy trình tuyển sinh.",
};

export default function NbaActionsPage() {
  return <NbaActionsAdminPage />;
}
