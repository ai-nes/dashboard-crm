import type { Metadata } from "next";

import TaskManagementPage from "@/app/(with-layouts)/(dashboard)/director/tasks/_components/task-management-page";

export const metadata: Metadata = {
  title: "Quản lý task",
  description:
    "Theo dõi task từ nhiều hồ sơ học sinh và mở nhanh đúng hồ sơ liên quan.",
};

export default function LeadSaleTasksPage() {
  return <TaskManagementPage />;
}
