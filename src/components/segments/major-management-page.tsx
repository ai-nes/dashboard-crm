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

import AcademicYearPanel from "../admin/admin-catalog/academic-year-panel";
import ChannelTypePanel from "../admin/admin-catalog/channel-type-panel";
import { GeographyCatalogManagement } from "./geography-catalog-management";
import { MajorCatalogManagement } from "./major-catalog-management";

type MajorManagementTab = "majors" | "geography" | "academic" | "channels";

export function MajorManagementPage() {
  const { user } = useAuth();
  const canManage = canManageMajorCatalog(user?.roles);
  const [activeTab, setActiveTab] = useState<MajorManagementTab>("majors");

  return (
    <main
      id="main-content"
      className="flex h-full min-h-0 min-w-0 flex-col gap-2 overflow-hidden px-2 pt-4 lg:px-6"
    >
      <AdminPageHeader
        section="Học sinh & địa bàn"
        title="Danh mục tuyển sinh"
        description="Quản lý ngành học, địa bàn, năm tuyển sinh và kênh chiến dịch dùng chung trong CRM."
        canEdit={canManage}
        metaLabel="Danh mục CRM"
        metaValue="Ngành, địa bàn, năm, kênh"
      />
      <AdminTabRoot
        defaultValue="majors"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as MajorManagementTab)}
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <AdminTabList>
          <TabTrigger value="majors">Ngành học</TabTrigger>
          <TabTrigger value="geography">Địa bàn & trường</TabTrigger>
          <TabTrigger value="academic">Năm tuyển sinh</TabTrigger>
          <TabTrigger value="channels">Kênh chiến dịch</TabTrigger>
        </AdminTabList>
        <AdminTabContent
          value="majors"
          className="mt-3 min-h-0 flex-1 overflow-hidden p-0"
        >
          <MajorCatalogManagement
            canManage={canManage}
            enabled={activeTab === "majors"}
          />
        </AdminTabContent>
        <AdminTabContent
          value="geography"
          className="mt-3 min-h-0 flex-1 overflow-hidden p-0"
        >
          <GeographyCatalogManagement
            canManage={canManage}
            enabled={activeTab === "geography"}
          />
        </AdminTabContent>
        <AdminTabContent
          value="academic"
          className="mt-3 min-h-0 flex-1 overflow-y-auto p-0"
        >
          <AcademicYearPanel />
        </AdminTabContent>
        <AdminTabContent
          value="channels"
          className="mt-3 min-h-0 flex-1 overflow-y-auto p-0"
        >
          <ChannelTypePanel />
        </AdminTabContent>
      </AdminTabRoot>
    </main>
  );
}
