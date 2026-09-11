"use client";

import { ChevronDown } from "@tailgrids/icons";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "react-aria-components";

import { Badge } from "@/components/tailgrids/core/badge";
import { cn } from "@/utils/cn";

import DetailTabSectionPopover from "./detail-tab-section-popover";

export interface DetailTabSection {
  id: string;
  label: string;
  content?: ReactNode;
}

export interface DetailTabItem {
  id: string;
  label: string;
  content: ReactNode;
  badge?: string | number;
  sections?: DetailTabSection[];
}

interface DetailTabsProps {
  ariaLabel: string;
  defaultSelectedKey: string;
  tabs: DetailTabItem[];
  className?: string;
  isSticky?: boolean;
  onSelectionChange?: (key: string) => void;
}

export default function DetailTabs({
  ariaLabel,
  defaultSelectedKey,
  tabs,
  className,
  isSticky = true,
  onSelectionChange,
}: DetailTabsProps) {
  const [selectedKey, setSelectedKey] = useState(defaultSelectedKey);
  const [openSectionTabId, setOpenSectionTabId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string>();
  const sectionTriggerRef = useRef<HTMLDivElement>(null);
  const closePopoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const openSectionTab = tabs.find(
    (tab) => tab.id === openSectionTabId && tab.sections?.length,
  );

  useEffect(
    () => () => {
      if (closePopoverTimerRef.current) {
        clearTimeout(closePopoverTimerRef.current);
      }
    },
    [],
  );

  const clearPopoverCloseTimer = () => {
    if (!closePopoverTimerRef.current) return;
    clearTimeout(closePopoverTimerRef.current);
    closePopoverTimerRef.current = null;
  };

  const schedulePopoverClose = () => {
    clearPopoverCloseTimer();
    closePopoverTimerRef.current = setTimeout(() => {
      setOpenSectionTabId(null);
      closePopoverTimerRef.current = null;
    }, 140);
  };

  const showSectionPopover = (tabId: string, trigger: HTMLDivElement) => {
    clearPopoverCloseTimer();
    sectionTriggerRef.current = trigger;
    setOpenSectionTabId(tabId);
  };

  const handleTabSelectionChange = (key: string) => {
    const selectedTab = tabs.find((tab) => tab.id === key);
    if (selectedTab?.sections?.length) {
      setOpenSectionTabId(key);
      return;
    }

    setSelectedKey(key);
    setOpenSectionTabId(null);
    onSelectionChange?.(key);
  };

  const handleSectionSelect = (sectionId: string) => {
    if (!openSectionTab) return;

    setSelectedSectionId(sectionId);
    setSelectedKey(openSectionTab.id);
    setOpenSectionTabId(null);
    onSelectionChange?.(openSectionTab.id);
  };

  const getTabContent = (tab: DetailTabItem) => {
    if (!tab.sections) return tab.content;
    return tab.sections.find((section) => section.id === selectedSectionId)
      ?.content;
  };

  return (
    <>
      <Tabs
        className={cn("min-w-0", className)}
        selectedKey={selectedKey}
        onSelectionChange={(key) => handleTabSelectionChange(String(key))}
      >
        <div
          className={cn(
            isSticky && "sticky top-0 z-30",
            "bg-card-surface-area",
          )}
        >
          <TabList
            aria-label={ariaLabel}
            className="flex max-w-full gap-1 overflow-x-auto border-b border-card-border px-1 [scrollbar-width:thin]"
          >
            {tabs.map((tab) => {
              const hasSections = Boolean(tab.sections?.length);

              return (
                <Tab
                  key={tab.id}
                  id={tab.id}
                  aria-haspopup={hasSections ? "dialog" : undefined}
                  ref={hasSections ? sectionTriggerRef : undefined}
                  onFocus={
                    hasSections
                      ? (event) =>
                          showSectionPopover(
                            tab.id,
                            event.currentTarget as HTMLDivElement,
                          )
                      : undefined
                  }
                  onMouseEnter={
                    hasSections
                      ? (event) =>
                          showSectionPopover(
                            tab.id,
                            event.currentTarget as HTMLDivElement,
                          )
                      : undefined
                  }
                  onBlur={hasSections ? schedulePopoverClose : undefined}
                  onMouseLeave={hasSections ? schedulePopoverClose : undefined}
                  className="group relative shrink-0 cursor-pointer px-3 py-3 text-sm font-medium text-text-secondary outline-none transition-colors hover:text-text-primary data-[selected=true]:text-primary-500 data-[focus-visible=true]:rounded-md data-[focus-visible=true]:ring-4 data-[focus-visible=true]:ring-button-outline-focus-ring"
                >
                  <span className="inline-flex items-center gap-1.5">
                    {tab.label}
                    {tab.badge !== undefined && tab.badge !== 0 && (
                      <Badge color="primary" size="sm">
                        {tab.badge}
                      </Badge>
                    )}
                    {hasSections && (
                      <ChevronDown
                        aria-hidden="true"
                        className="size-4 text-text-tertiary transition-transform group-data-[selected=true]:text-primary-500"
                      />
                    )}
                  </span>
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-3 bottom-0 h-0.5 scale-x-0 bg-primary-500 transition-transform duration-200 group-data-[selected=true]:scale-x-100 motion-reduce:transition-none"
                  />
                </Tab>
              );
            })}
          </TabList>
        </div>

        <TabPanels className="min-w-0 pt-6">
          {tabs.map((tab) => (
            <TabPanel
              key={tab.id}
              id={tab.id}
              className="min-w-0 outline-none data-[focus-visible=true]:rounded-md data-[focus-visible=true]:ring-4 data-[focus-visible=true]:ring-button-outline-focus-ring"
            >
              {getTabContent(tab)}
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>

      {openSectionTab && (
        <DetailTabSectionPopover
          isOpen
          onOpenChange={(isOpen) => {
            if (isOpen) return;
            setOpenSectionTabId(null);
          }}
          onPointerEnter={clearPopoverCloseTimer}
          onPointerLeave={schedulePopoverClose}
          onSectionSelect={handleSectionSelect}
          sections={openSectionTab.sections ?? []}
          selectedSectionId={selectedSectionId}
          triggerRef={sectionTriggerRef}
        />
      )}
    </>
  );
}
