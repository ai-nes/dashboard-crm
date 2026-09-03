"use client";

import type { ReactNode } from "react";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "react-aria-components";

import { cn } from "@/utils/cn";

export interface DetailTabItem {
  id: string;
  label: string;
  content: ReactNode;
}

interface DetailTabsProps {
  ariaLabel: string;
  defaultSelectedKey: string;
  tabs: DetailTabItem[];
  className?: string;
  isSticky?: boolean;
}

export default function DetailTabs({
  ariaLabel,
  defaultSelectedKey,
  tabs,
  className,
  isSticky = true,
}: DetailTabsProps) {
  return (
    <Tabs
      className={cn("min-w-0", className)}
      defaultSelectedKey={defaultSelectedKey}
    >
      <div className={cn(isSticky && "sticky top-0 z-30", "bg-card-surface-area")}>
        <TabList
          aria-label={ariaLabel}
          className="flex max-w-full gap-1 overflow-x-auto border-b border-card-border px-1 [scrollbar-width:thin]"
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              id={tab.id}
              className="group relative shrink-0 cursor-pointer px-3 py-3 text-sm font-medium text-text-secondary outline-none transition-colors hover:text-text-primary data-[selected=true]:text-primary-500 data-[focus-visible=true]:rounded-md data-[focus-visible=true]:ring-4 data-[focus-visible=true]:ring-button-outline-focus-ring"
            >
              {tab.label}
              <span
                aria-hidden="true"
                className="absolute inset-x-3 bottom-0 h-0.5 scale-x-0 bg-primary-500 transition-transform duration-200 group-data-[selected=true]:scale-x-100 motion-reduce:transition-none"
              />
            </Tab>
          ))}
        </TabList>
      </div>

      <TabPanels className="min-w-0 pt-6">
        {tabs.map((tab) => (
          <TabPanel
            key={tab.id}
            id={tab.id}
            className="min-w-0 outline-none data-[focus-visible=true]:rounded-md data-[focus-visible=true]:ring-4 data-[focus-visible=true]:ring-button-outline-focus-ring"
          >
            {tab.content}
          </TabPanel>
        ))}
      </TabPanels>
    </Tabs>
  );
}
