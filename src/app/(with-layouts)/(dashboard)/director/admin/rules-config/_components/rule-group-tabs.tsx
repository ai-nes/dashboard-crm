"use client";

import { Tab, TabList, Tabs } from "react-aria-components";

import type { CrmRuleGroupSummary } from "@/services/api/rules-config";

interface RuleGroupTabsProps {
  groups: CrmRuleGroupSummary[];
  selectedGroup: string;
  onGroupChange: (groupId: string) => void;
  isLoading?: boolean;
}

export function RuleGroupTabs({
  groups,
  selectedGroup,
  onGroupChange,
  isLoading = false,
}: RuleGroupTabsProps) {
  return (
    <Tabs
      selectedKey={selectedGroup}
      onSelectionChange={(key) => onGroupChange(String(key))}
      className="min-w-0"
    >
      <TabList
        aria-label="Nhóm Rule"
        className="flex min-w-0 gap-1 overflow-x-auto border-b border-card-border px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <Tab
          id="all"
          className="group relative flex min-h-11 shrink-0 cursor-pointer items-center gap-2 px-3 text-sm font-medium text-text-secondary outline-none transition-colors hover:text-text-primary data-[selected]:text-primary-500 data-[focus-visible]:rounded-md data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-[-2px] data-[focus-visible]:outline-primary-500"
        >
          Tất cả
          <span className="rounded-md bg-background-gray-secondary px-1.5 py-0.5 text-xs tabular-nums group-data-[selected]:bg-badge-primary-background group-data-[selected]:text-badge-primary-text">
            {isLoading ? "..." : groups.reduce((total, group) => total + group.count, 0)}
          </span>
          <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary-500 opacity-0 transition-opacity group-data-[selected]:opacity-100" />
        </Tab>
        {groups.map((group) => (
          <Tab
            key={group.groupId}
            id={group.groupId}
            className="group relative flex min-h-11 shrink-0 cursor-pointer items-center gap-2 px-3 text-sm font-medium text-text-secondary outline-none transition-colors hover:text-text-primary data-[selected]:text-primary-500 data-[focus-visible]:rounded-md data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-[-2px] data-[focus-visible]:outline-primary-500"
          >
            {group.label}
            <span className="rounded-md bg-background-gray-secondary px-1.5 py-0.5 text-xs tabular-nums group-data-[selected]:bg-badge-primary-background group-data-[selected]:text-badge-primary-text">
              {group.count}
            </span>
            <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary-500 opacity-0 transition-opacity group-data-[selected]:opacity-100" />
          </Tab>
        ))}
      </TabList>
    </Tabs>
  );
}
