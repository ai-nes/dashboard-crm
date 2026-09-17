"use client";

import type { ReactNode } from "react";

import {
  AdminTabContent,
  AdminTabList,
  AdminTabRoot,
} from "@/components/common/admin/admin-tabs";
import { TabTrigger } from "@/components/tailgrids/core/tabs";

import ActionTypesTable from "../../action-recommendations/_components/action-types-table";
import TimingPoliciesTable from "../../action-recommendations/_components/timing-policies-table";
import RulesConfigAdminPage from "../../rules-config/_components/rules-config-admin-page";

interface NbaAdminTabsProps {
  actionsPanel: ReactNode;
  actionCount: number;
  canEdit: boolean;
}

export default function NbaAdminTabs({
  actionsPanel,
  actionCount,
  canEdit,
}: NbaAdminTabsProps) {
  return (
    <AdminTabRoot
      defaultValue="actions"
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <AdminTabList>
        <TabTrigger value="actions" badge={actionCount || undefined}>
          Hành động
        </TabTrigger>
        <TabTrigger value="action-types">Nhóm hành động</TabTrigger>
        <TabTrigger value="timing-policies">Chính sách thời gian</TabTrigger>
        <TabTrigger value="rules-config">Quản lý Rule</TabTrigger>
      </AdminTabList>

      <AdminTabContent value="actions">{actionsPanel}</AdminTabContent>
      <AdminTabContent value="action-types">
        <ActionTypesTable canEdit={canEdit} />
      </AdminTabContent>
      <AdminTabContent value="timing-policies">
        <TimingPoliciesTable canEdit={canEdit} />
      </AdminTabContent>
      <AdminTabContent value="rules-config">
        <RulesConfigAdminPage embedded />
      </AdminTabContent>
    </AdminTabRoot>
  );
}
