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
  canReadActions: boolean;
  canReadActionTypes: boolean;
  actionTypesPermissions: {
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export default function NbaAdminTabs({
  actionsPanel,
  actionCount,
  canReadActions,
  canReadActionTypes,
  actionTypesPermissions,
}: NbaAdminTabsProps) {
  const defaultValue = canReadActions ? "actions" : "action-types";

  return (
    <AdminTabRoot
      defaultValue={defaultValue}
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <AdminTabList>
        {canReadActions && (
          <TabTrigger value="actions" badge={actionCount || undefined}>
            Hành động
          </TabTrigger>
        )}
        {canReadActionTypes && (
          <TabTrigger value="action-types">Nhóm hành động</TabTrigger>
        )}
      </AdminTabList>

      {canReadActions && (
        <AdminTabContent value="actions">{actionsPanel}</AdminTabContent>
      )}
      {canReadActionTypes && (
        <AdminTabContent value="action-types">
          <ActionTypesTable
            canRead={canReadActionTypes}
            {...actionTypesPermissions}
          />
        </AdminTabContent>
      )}
    </AdminTabRoot>
  );
}
