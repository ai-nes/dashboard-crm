"use client";

import type { ReactNode } from "react";

import { TabContent, TabList, TabRoot, TabTrigger } from "@/components/tailgrids/core/tabs";

import ActionTypesTable from "../../action-recommendations/_components/action-types-table";
import RecommendationRulesTable from "../../action-recommendations/_components/recommendation-rules-table";
import TimingPoliciesTable from "../../action-recommendations/_components/timing-policies-table";

interface NbaAdminTabsProps {
  actionsPanel: ReactNode;
  actionCount: number;
  canEdit: boolean;
}

export default function NbaAdminTabs({ actionsPanel, actionCount, canEdit }: NbaAdminTabsProps) {
  return (
    <TabRoot defaultValue="actions" variant="minimal" className="overflow-hidden bg-card-background">
        <TabList className="px-2 sm:px-4">
          <TabTrigger value="actions" badge={actionCount || undefined}>Hành động</TabTrigger>
          <TabTrigger value="action-types">Nhóm hành động</TabTrigger>
          <TabTrigger value="timing-policies">Chính sách thời gian</TabTrigger>
          <TabTrigger value="rules">Quy tắc đề xuất</TabTrigger>
        </TabList>

        <TabContent value="actions" className="p-3 sm:p-4">
          {actionsPanel}
        </TabContent>
        <TabContent value="action-types" className="p-3 sm:p-4">
          <ActionTypesTable canEdit={canEdit} />
        </TabContent>
        <TabContent value="timing-policies" className="p-3 sm:p-4">
          <TimingPoliciesTable canEdit={canEdit} />
        </TabContent>
        <TabContent value="rules" className="p-3 sm:p-4">
          <RecommendationRulesTable canEdit={canEdit} />
        </TabContent>
      </TabRoot>
  );
}
