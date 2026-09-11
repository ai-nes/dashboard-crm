import type { Metadata } from "next";

import UserManagementAdminPage from "./_components/user-management-admin-page";

export const metadata: Metadata = {
  title: "Quản lý người dùng",
  description: "Quản lý vai trò và quyền truy cập người dùng CRM của FAIP.",
};

export default function UsersPage() {
  return <UserManagementAdminPage />;
}
