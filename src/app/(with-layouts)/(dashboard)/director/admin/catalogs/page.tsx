import type { Metadata } from "next";

import AdminCatalogManagementPage from "@/components/admin/admin-catalog/admin-catalog-management-page";

export const metadata: Metadata = {
  title: "Cấu hình điểm tiềm năng",
  description: "Quản lý mẫu chấm điểm và quy tắc tính điểm tiềm năng trong CRM.",
};

export default function AdminCatalogsPage() {
  return <AdminCatalogManagementPage />;
}
