"use client";

import { Plus } from "@tailgrids/icons";
import { useState } from "react";

import { useAuth } from "@/components/common/auth/auth-provider";
import { hasCrmCapability } from "@/components/common/auth/permissions";
import { hasFrappeTechnicalRole } from "@/components/common/auth/rbac";
import AdminPageHeader from "@/components/common/admin/admin-page-header";
import { Button } from "@/components/tailgrids/core/button";
import { TabContent, TabList, TabRoot, TabTrigger } from "@/components/tailgrids/core/tabs";

import RuleVersionActions from "./rule-version-actions";
import { RuleVersionList } from "./rule-version-list";

export function RuleVersionsPage() {
  const { user } = useAuth();
  const canEdit = hasCrmCapability(user, "rule.manage") || hasFrappeTechnicalRole(user?.roles, "System Manager");
  const [createOpen, setCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("manage");

  return (
    <main id="main-content" className="flex h-full min-h-0 min-w-0 flex-col gap-2 overflow-hidden px-2 pt-4 lg:px-6">
      <AdminPageHeader
        section="Rule"
        title="Quản lý rule"
        description="Quản lý các Version Rule tuyển sinh."
        canEdit={canEdit}
        actions={
          canEdit ? (
            <Button size="md" className="shrink-0" onPress={() => setCreateOpen(true)}>
              <Plus size={16} aria-hidden="true" />
              Tạo version
            </Button>
          ) : null
        }
        metaLabel="Đồng bộ từ Frappe CRM"
        metaValue="Rule trong từng Version"
      />
      <TabRoot
        defaultValue="manage"
        value={activeTab}
        onValueChange={setActiveTab}
        variant="minimal"
        className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-none border-0 bg-transparent"
      >
        <TabList className="px-1 sm:px-2">
          <TabTrigger value="manage">Quản lý</TabTrigger>
          <TabTrigger value="analyze">Phân tích</TabTrigger>
        </TabList>
        <TabContent value="manage" className="min-h-0 flex-1 overflow-y-auto px-0 pt-5 pb-8">
          <RuleVersionList canEdit={canEdit} />
        </TabContent>
        <TabContent value="analyze" className="min-h-0 flex-1 overflow-y-auto px-0 pt-5 pb-8">
          <section className="rounded-2xl border border-card-border bg-card-background p-10 text-center shadow-xs">
            <h2 className="text-base font-semibold text-text-primary">Phân tích Version</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-secondary">
              Khu vực phân tích Version sẽ được triển khai sau.
            </p>
          </section>
        </TabContent>
      </TabRoot>
      <RuleVersionActions key={createOpen ? "create-open" : "create-closed"} version={null} canEdit={canEdit} showEmptyCreateButton={false} openCreate={createOpen} onCreateOpenChange={setCreateOpen} onCreated={() => setCreateOpen(false)} onChanged={() => undefined} />
    </main>
  );
}
