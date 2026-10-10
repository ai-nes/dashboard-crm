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
  getStudentConfigurationPermissions,
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
  const permissions = getStudentConfigurationPermissions(user);
  const canEdit = Object.values(permissions).some(
    ({ canCreate, canUpdate, canDelete }) =>
      canCreate || canUpdate || canDelete,
  );

  return (
    <main
      id="main-content"
      className="flex h-full min-h-0 min-w-0 flex-col gap-2 overflow-hidden px-2 pt-4 lg:px-6"
    >
      <AdminPageHeader
        section="Học sinh"
        title="Cấu hình học sinh"
        description="Danh mục hồ sơ học sinh."
        canEdit={canEdit}
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
          {permissions.needs.canRead && permissions.needGroups.canRead ? (
            <ClassificationGroupManagement
              kind="need"
              permissions={{
                groups: permissions.needGroups,
                terms: permissions.needs,
              }}
              compactStatus
            />
          ) : (
            <CatalogReadDenied />
          )}
        </AdminTabContent>
        <AdminTabContent
          value="tags"
          className="flex min-h-0 flex-1 flex-col overflow-hidden px-0"
        >
          {permissions.tags.canRead && permissions.tagGroups.canRead ? (
            <ClassificationGroupManagement
              kind="tag"
              permissions={{
                groups: permissions.tagGroups,
                terms: permissions.tags,
              }}
              compactStatus
            />
          ) : (
            <CatalogReadDenied />
          )}
        </AdminTabContent>
        <AdminTabContent
          value="profile-types"
          className="flex min-h-0 flex-1 flex-col overflow-hidden px-0"
        >
          {permissions.admissionProfileTemplates.canRead ? (
            <AdmissionProfileTemplateManagement
              permissions={permissions.admissionProfileTemplates}
              canReadMethods={permissions.admissionMethods.canRead}
            />
          ) : (
            <CatalogReadDenied />
          )}
        </AdminTabContent>
        <AdminTabContent
          value="document-types"
          className="flex min-h-0 flex-1 flex-col overflow-hidden px-0"
        >
          {permissions.admissionDocumentTypes.canRead ? (
            <AdmissionDocumentTypeManagement
              permissions={permissions.admissionDocumentTypes}
            />
          ) : (
            <CatalogReadDenied />
          )}
        </AdminTabContent>
        <AdminTabContent
          value="admission-methods"
          className="flex min-h-0 flex-1 flex-col overflow-hidden px-0"
        >
          {permissions.admissionMethods.canRead ? (
            <AdmissionMethodManagement
              permissions={permissions.admissionMethods}
            />
          ) : (
            <CatalogReadDenied />
          )}
        </AdminTabContent>
      </AdminTabRoot>
    </main>
  );
}

function CatalogReadDenied() {
  return (
    <section
      className="rounded-xl border border-card-border bg-card-background p-5 text-sm text-text-secondary"
      role="status"
    >
      Bạn không có quyền xem danh mục này.
    </section>
  );
}
