"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

import {
  AdminTabContent,
  AdminTabList,
  AdminTabRoot,
} from "@/components/common/admin/admin-tabs";
import AdminPageHeader from "@/components/common/admin/admin-page-header";
import { useAuth } from "@/components/common/auth/auth-provider";
import { TabTrigger } from "@/components/tailgrids/core/tabs";
import { AdmissionDocumentTypeManagement } from "@/components/segments/admission-document-type-management";
import { AdmissionMethodManagement } from "@/components/segments/admission-method-management";
import { ClassificationGroupManagement } from "@/components/segments/classification-group-management";
import { AdmissionProfileTemplateManagement } from "@/components/segments/admission-profile-template-management";
import {
  canDeleteAdmissionDocumentTypes,
  canDeleteAdmissionMethods,
  canManageAdmissionDocumentTypes,
  canManageAdmissionMethods,
  canManageStudentConfiguration,
} from "@/components/segments/student-configuration-permissions";

type ConfigurationTab =
  | "needs"
  | "tags"
  | "profile-types"
  | "document-types"
  | "admission-methods";

const CONFIGURATION_TAB_VALUES = new Set<ConfigurationTab>([
  "needs",
  "tags",
  "profile-types",
  "document-types",
  "admission-methods",
]);

function isConfigurationTab(value: string | null): value is ConfigurationTab {
  return Boolean(
    value && CONFIGURATION_TAB_VALUES.has(value as ConfigurationTab),
  );
}

export function StudentConfigurationPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    const requestedTab = searchParams.get("tab");
    return isConfigurationTab(requestedTab) ? requestedTab : "needs";
  });
  const { user } = useAuth();
  const canManage = canManageStudentConfiguration(user?.roles);
  const canManageDocumentTypes = canManageAdmissionDocumentTypes(user?.roles);
  const canDeleteDocumentTypes = canDeleteAdmissionDocumentTypes(user?.roles);
  const canManageMethods = canManageAdmissionMethods(user?.roles);
  const canDeleteMethods = canDeleteAdmissionMethods(user?.roles);

  return (
    <main
      id="main-content"
      className="flex h-full min-h-0 min-w-0 flex-col gap-2 overflow-hidden px-2 pt-4 lg:px-6"
    >
      <AdminPageHeader
        section="Học sinh"
        title="Cấu hình học sinh"
        description="Danh mục hồ sơ học sinh."
        canEdit={canManage}
        metaLabel="Danh mục CRM"
        metaValue="Cấu hình nền tảng tuyển sinh"
      />
      <AdminTabRoot
        defaultValue="needs"
        value={activeTab}
        onValueChange={(value) => {
          if (isConfigurationTab(value)) setActiveTab(value);
        }}
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <AdminTabList>
          <TabTrigger value="needs">Nhu cầu</TabTrigger>
          <TabTrigger value="tags">Tag</TabTrigger>
          <TabTrigger value="profile-types">Loại hồ sơ</TabTrigger>
          <TabTrigger value="document-types">Loại tài liệu</TabTrigger>
          <TabTrigger value="admission-methods">
            Phương thức xét tuyển
          </TabTrigger>
        </AdminTabList>
        <AdminTabContent
          value="needs"
          className="flex min-h-0 flex-1 flex-col overflow-hidden px-0"
        >
          <ClassificationGroupManagement
            kind="need"
            canManage={canManage}
            compactStatus
          />
        </AdminTabContent>
        <AdminTabContent
          value="tags"
          className="flex min-h-0 flex-1 flex-col overflow-hidden px-0"
        >
          <ClassificationGroupManagement
            kind="tag"
            canManage={canManage}
            compactStatus
          />
        </AdminTabContent>
        <AdminTabContent
          value="profile-types"
          className="flex min-h-0 flex-1 flex-col overflow-hidden px-0"
        >
          <AdmissionProfileTemplateManagement canManage={canManage} />
        </AdminTabContent>
        <AdminTabContent
          value="document-types"
          className="flex min-h-0 flex-1 flex-col overflow-hidden px-0"
        >
          <AdmissionDocumentTypeManagement
            canManage={canManageDocumentTypes}
            canDelete={canDeleteDocumentTypes}
          />
        </AdminTabContent>
        <AdminTabContent
          value="admission-methods"
          className="flex min-h-0 flex-1 flex-col overflow-hidden px-0"
        >
          <AdmissionMethodManagement
            canManage={canManageMethods}
            canDelete={canDeleteMethods}
          />
        </AdminTabContent>
      </AdminTabRoot>
    </main>
  );
}
