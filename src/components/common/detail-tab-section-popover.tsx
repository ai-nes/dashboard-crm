"use client";

import type { RefObject } from "react";
import { ListBox, ListBoxItem, Popover, type Key } from "react-aria-components";

import type { DetailTabSection } from "./detail-tabs";

interface DetailTabSectionPopoverProps {
  sections: DetailTabSection[];
  selectedSectionId?: string;
  triggerRef: RefObject<HTMLDivElement | null>;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSectionSelect: (sectionId: string) => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
}

export default function DetailTabSectionPopover({
  sections,
  selectedSectionId,
  triggerRef,
  isOpen,
  onOpenChange,
  onSectionSelect,
  onPointerEnter,
  onPointerLeave,
}: DetailTabSectionPopoverProps) {
  if (!isOpen || sections.length === 0) return null;

  return (
    <Popover
      aria-label="Các mục trong thông tin học sinh"
      className="z-50 w-[min(20rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-card-border bg-background-white-secondary p-2 shadow-lg"
      isNonModal
      isOpen={isOpen}
      offset={6}
      placement="bottom start"
      triggerRef={triggerRef}
      onMouseEnter={onPointerEnter}
      onMouseLeave={onPointerLeave}
      onOpenChange={onOpenChange}
    >
      <div
        onFocus={onPointerEnter}
        onBlur={(event) => {
          const relatedTarget = event.relatedTarget as Node | null;
          if (!relatedTarget || !event.currentTarget.contains(relatedTarget)) {
            onPointerLeave();
          }
        }}
      >
        <ListBox
          aria-label="Các section trong thông tin học sinh"
          className="outline-none"
          selectedKeys={selectedSectionId ? [selectedSectionId] : []}
          selectionMode="single"
          onSelectionChange={(keys) => {
            if (keys === "all") return;
            const selectedKey = [...keys][0] as Key | undefined;
            if (selectedKey !== undefined) onSectionSelect(String(selectedKey));
          }}
        >
          {sections.map((section) => (
            <ListBoxItem
              key={section.id}
              id={section.id}
              textValue={section.label}
              className="flex w-full cursor-pointer items-center rounded-xl px-3 py-3 text-sm text-text-secondary outline-none transition-colors data-[focused=true]:bg-dropdown-hover-background data-[selected=true]:bg-badge-orange-background data-[selected=true]:text-text-primary"
            >
              <span className="min-w-0 truncate font-medium">
                {section.label}
              </span>
            </ListBoxItem>
          ))}
        </ListBox>
      </div>
    </Popover>
  );
}
