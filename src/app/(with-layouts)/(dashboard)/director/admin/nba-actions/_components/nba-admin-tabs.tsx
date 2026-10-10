"use client";

import type { ReactNode } from "react";

import {
  AdminTabContent,
  AdminTabList,
  AdminTabRoot,
} from "@/components/common/admin/admin-tabs";
import { TabTrigger } from "@/components/tailgrids/core/tabs";

import ActionTypesTable from "../../action-recommendations/_components/action-types-table";

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
      </AdminTabList>

      <AdminTabContent value="actions">{actionsPanel}</AdminTabContent>
      <AdminTabContent value="action-types">
        <ActionTypesTable canEdit={canEdit} />
      </AdminTabContent>
    </AdminTabRoot>
  );
}
