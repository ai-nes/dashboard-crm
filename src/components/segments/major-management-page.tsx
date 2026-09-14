"use client";

import AdminPageHeader from "@/components/common/admin/admin-page-header";
import { useAuth } from "@/components/common/auth/auth-provider";
import { canManageMajorCatalog } from "@/components/segments/student-configuration-permissions";

import { MajorCatalogManagement } from "./major-catalog-management";

export function MajorManagementPage() {
  const { user } = useAuth();
  const canManage = canManageMajorCatalog(user?.roles);

  return (
    <main
      id="main-content"
      className="flex h-full min-h-0 min-w-0 flex-col gap-2 overflow-hidden px-2 pt-4 lg:px-6"
    >
      <AdminPageHeader
        section="Học sinh"
        title="Quản lý ngành học"
        description="Quản lý các Major Group. Chọn một group để xem và quản lý các ngành học bên trong."
        canEdit={canManage}
        metaLabel="Danh mục CRM"
        metaValue="Danh mục Major Group"
      />
      <MajorCatalogManagement canManage={canManage} />
    </main>
  );
}
