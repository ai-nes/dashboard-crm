"use client";

import { Plus, Search1 } from "@tailgrids/icons";
import type { ReactNode } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-aria-components";

import { Button } from "@/components/tailgrids/core/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/tailgrids/core/input-group";
import type {
  CrmRule,
  CrmRuleFeatureScope,
  CrmRuleGateOutcome,
  CrmRuleStatus,
  CrmRuleType,
} from "@/services/api/rules-config";

import { RuleFiltersPopover } from "./rule-filters-popover";

const STATUS_TABS: Array<{ id: CrmRuleStatus | "all"; label: string }> = [
  { id: "all", label: "Tất cả" },
  { id: "draft", label: "Bản nháp" },
  { id: "testing", label: "Đang kiểm thử" },
  { id: "active", label: "Đang hoạt động" },
  { id: "archived", label: "Đã lưu trữ" },
];

interface RuleListToolbarProps {
  allRules: CrmRule[];
  filteredCount: number;
  search: string;
  onSearchChange: (value: string) => void;
  status: CrmRuleStatus | "all";
  onStatusChange: (value: CrmRuleStatus | "all") => void;
  featureScope: CrmRuleFeatureScope | "all";
  onFeatureScopeChange: (value: CrmRuleFeatureScope | "all") => void;
  ruleType: CrmRuleType | "all";
  onRuleTypeChange: (value: CrmRuleType | "all") => void;
  gateOutcome: CrmRuleGateOutcome | "all";
  onGateOutcomeChange: (value: CrmRuleGateOutcome | "all") => void;
  canCreate: boolean;
  onCreate: () => void;
  children: ReactNode;
}

export function RuleListToolbar({
  allRules,
  filteredCount,
  search,
  onSearchChange,
  status,
  onStatusChange,
  featureScope,
  onFeatureScopeChange,
  ruleType,
  onRuleTypeChange,
  gateOutcome,
  onGateOutcomeChange,
  canCreate,
  onCreate,
  children,
}: RuleListToolbarProps) {
  const tabs = STATUS_TABS.map((tab) => ({
    ...tab,
    count:
      tab.id === "all"
        ? allRules.length
        : allRules.filter((rule) => rule.status === tab.id).length,
  }));

  return (
    <Tabs
      selectedKey={status}
      onSelectionChange={(key) => onStatusChange(key as CrmRuleStatus | "all")}
    >
      <div className="space-y-3 border-b border-card-border px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <InputGroup className="h-10 w-full sm:max-w-md">
            <InputGroupAddon align="inline-start" className="pr-0 text-text-tertiary">
              <Search1 size={18} aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              type="search"
              aria-label="Tìm Rule"
              placeholder="Tìm mã, tên Rule hoặc action..."
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              className="pl-2 text-sm"
            />
          </InputGroup>
          <span aria-live="polite" className="text-xs text-text-tertiary">
            {filteredCount} / {allRules.length} Rule
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabList aria-label="Lọc trạng thái Rule" className="flex flex-wrap gap-1.5">
            {tabs.map((tab) => (
              <Tab
                key={tab.id}
                id={tab.id}
                className="group flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary outline-none hover:bg-background-gray-secondary_alt data-[selected]:bg-badge-primary-background data-[selected]:text-badge-primary-text data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-primary-500"
              >
                {tab.label}
                <span className="rounded-md bg-background-gray-secondary px-1.5 py-0.5 text-xs tabular-nums group-data-[selected]:bg-badge-primary-background group-data-[selected]:text-badge-primary-text">
                  {tab.count}
                </span>
              </Tab>
            ))}
          </TabList>
          <div className="flex flex-wrap items-center gap-2">
            <RuleFiltersPopover
              featureScope={featureScope}
              onFeatureScopeChange={onFeatureScopeChange}
              ruleType={ruleType}
              onRuleTypeChange={onRuleTypeChange}
              gateOutcome={gateOutcome}
              onGateOutcomeChange={onGateOutcomeChange}
            />
            {canCreate ? (
              <Button type="button" size="sm" onPress={onCreate}>
                <Plus size={16} aria-hidden="true" />
                Tạo Rule
              </Button>
            ) : null}
          </div>
        </div>
      </div>
      <TabPanel
        id={status}
        className="outline-none focus-visible:outline-2 focus-visible:outline-primary-500"
      >
        {children}
      </TabPanel>
    </Tabs>
  );
}
