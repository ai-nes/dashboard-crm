import type { Metadata } from "next";

import AdminCatalogManagementPage from "@/components/admin/admin-catalog/admin-catalog-management-page";

export const metadata: Metadata = {
  title: "Danh mục & chính sách",
  description: "Quản lý danh mục và policy vận hành CRM.",
};

export default function AdminCatalogsPage() {
  return <AdminCatalogManagementPage />;
}
