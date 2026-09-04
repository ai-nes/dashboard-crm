import type { Metadata } from "next";

import TaskManagementPage from "./_components/task-management-page";

export const metadata: Metadata = {
  title: "Quản lý task",
  description: "Theo dõi task từ nhiều hồ sơ học sinh và mở nhanh đúng hồ sơ liên quan.",
};

export default function TasksPage() {
  return <TaskManagementPage />;
}
