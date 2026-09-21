"use client";

import AdminPageHeader from "@/components/common/admin/admin-page-header";
import ScoreTemplatePanel from "./score-template-panel";

export default function AdminCatalogManagementPage() {
  return (
    <main
      id="main-content"
      className="flex h-full min-h-0 min-w-0 flex-col gap-2 overflow-hidden px-2 pt-4 lg:px-6"
    >
      <AdminPageHeader
        section="Cấu hình quản trị"
        title="Cấu hình điểm tiềm năng"
        description="Quản lý mẫu chấm điểm và quy tắc tính điểm tiềm năng cho tuyển sinh CRM."
      />
      <div className="mt-3 min-h-0 flex-1 overflow-y-auto p-0">
        <ScoreTemplatePanel />
      </div>
    </main>
  );
}
