"use client";

import { useState } from "react";

import {
  AdminTabContent,
  AdminTabList,
  AdminTabRoot,
} from "@/components/common/admin/admin-tabs";
import AdminPageHeader from "@/components/common/admin/admin-page-header";
import { useAuth } from "@/components/common/auth/auth-provider";
import { canManageMajorCatalog } from "@/components/segments/student-configuration-permissions";
import { TabTrigger } from "@/components/tailgrids/core/tabs";

import { GeographyCatalogManagement } from "./geography-catalog-management";
import { MajorCatalogManagement } from "./major-catalog-management";

export function MajorManagementPage() {
  const { user } = useAuth();
  const canManage = canManageMajorCatalog(user?.roles);
  const [activeTab, setActiveTab] = useState<"majors" | "geography">("majors");

  return (
    <main
      id="main-content"
      className="flex h-full min-h-0 min-w-0 flex-col gap-2 overflow-hidden px-2 pt-4 lg:px-6"
    >
      <AdminPageHeader
        section="Học sinh & địa bàn"
        title="Danh mục tuyển sinh"
        description="Quản lý ngành học, địa bàn và danh bạ trường dùng chung trong CRM."
        canEdit={canManage}
        metaLabel="Danh mục CRM"
        metaValue="Ngành, địa bàn, trường"
      />
      <AdminTabRoot
        defaultValue="majors"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "majors" | "geography")}
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <AdminTabList>
          <TabTrigger value="majors">Ngành học</TabTrigger>
          <TabTrigger value="geography">Địa bàn & trường</TabTrigger>
        </AdminTabList>
        <AdminTabContent
          value="majors"
          className="min-h-0 flex-1 overflow-hidden p-0"
        >
          <MajorCatalogManagement
            canManage={canManage}
            enabled={activeTab === "majors"}
          />
        </AdminTabContent>
        <AdminTabContent
          value="geography"
          className="min-h-0 flex-1 overflow-hidden p-0"
        >
          <GeographyCatalogManagement
            canManage={canManage}
            enabled={activeTab === "geography"}
          />
        </AdminTabContent>
      </AdminTabRoot>
    </main>
  );
}
