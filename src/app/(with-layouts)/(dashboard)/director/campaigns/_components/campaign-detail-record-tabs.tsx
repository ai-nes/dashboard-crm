"use client";

import { Tab, TabList, Tabs } from "react-aria-components";

import { cn } from "@/utils/cn";

export type CampaignDetailRecordView = "leads" | "students";

interface CampaignDetailRecordTabsProps {
  selectedKey: CampaignDetailRecordView;
  onSelectionChange: (view: CampaignDetailRecordView) => void;
}

export default function CampaignDetailRecordTabs({
  selectedKey,
  onSelectionChange,
}: CampaignDetailRecordTabsProps) {
  const tabClassName = cn(
    "cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium text-text-secondary outline-none transition-colors",
    "hover:text-text-primary data-[selected=true]:bg-card-background data-[selected=true]:text-primary-500 data-[selected=true]:shadow-xs",
    "data-[focus-visible=true]:ring-4 data-[focus-visible=true]:ring-button-outline-focus-ring",
  );

  return (
    <Tabs
      selectedKey={selectedKey}
      onSelectionChange={(key) => {
        if (key === "leads" || key === "students") onSelectionChange(key);
      }}
      className="shrink-0"
    >
      <TabList
        aria-label="Loại hồ sơ trong chiến dịch"
        className="flex w-fit gap-1 rounded-lg border border-card-border bg-background-gray-secondary_alt p-1"
      >
        <Tab id="leads" className={tabClassName}>
          Lead
        </Tab>
        <Tab id="students" className={tabClassName}>
          Học sinh
        </Tab>
      </TabList>
    </Tabs>
  );
}
