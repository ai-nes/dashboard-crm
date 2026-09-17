"use client";

import AdminPageHeader from "@/components/common/admin/admin-page-header";
import {
  AdminTabContent,
  AdminTabList,
  AdminTabRoot,
} from "@/components/common/admin/admin-tabs";
import { TabTrigger } from "@/components/tailgrids/core/tabs";
import AcademicYearPanel from "./academic-year-panel";
import ChannelTypePanel from "./channel-type-panel";
import ScoreTemplatePanel from "./score-template-panel";

export default function AdminCatalogManagementPage() {
  return (
    <main
      id="main-content"
      className="min-w-0 space-y-5 px-2 py-4 pb-8 lg:px-6"
    >
      <AdminPageHeader
        section="Cấu hình quản trị"
        title="Danh mục & chính sách"
        description="Quản lý các danh mục dùng chung và chính sách vận hành tuyển sinh CRM."
      />
      <AdminTabRoot
        defaultValue="academic"
        className="min-h-0 border-0 bg-transparent shadow-none"
      >
        <AdminTabList>
          <TabTrigger value="academic">Năm tuyển sinh</TabTrigger>
          <TabTrigger value="score">Mẫu chấm điểm</TabTrigger>
          <TabTrigger value="channels">Kênh chiến dịch</TabTrigger>
        </AdminTabList>
        <div className="mt-5">
          <AdminTabContent value="academic">
            <AcademicYearPanel />
          </AdminTabContent>
          <AdminTabContent value="score">
            <ScoreTemplatePanel />
          </AdminTabContent>
          <AdminTabContent value="channels">
            <ChannelTypePanel />
          </AdminTabContent>
        </div>
      </AdminTabRoot>
    </main>
  );
}
