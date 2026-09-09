"use client";

import { Check, ChevronDown, Plus, Search1 } from "@tailgrids/icons";
import { useMemo, useState } from "react";

import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { OverlayWrapper } from "@/components/tailgrids/core/overlay";
import { Popover } from "@/components/tailgrids/core/popover";
import { cn } from "@/utils/cn";

import {
  CLASSIFICATION_PROPERTIES,
  getClassificationGroups,
  isClassificationProperty,
  SEGMENT_PROPERTIES,
  SEGMENT_PROPERTY_CONFIG,
  type SegmentFilterOptions,
  type StudentSegmentProperty,
} from "./segment-filter-config";

interface SegmentFilterPropertyPickerProps {
  options?: SegmentFilterOptions;
  onSelect: (
    property: StudentSegmentProperty,
    values?: string[],
    groupName?: string,
  ) => void;
  triggerLabel?: string;
  className?: string;
  showPlus?: boolean;
  selectedProperty?: StudentSegmentProperty;
  selectedValues?: string[];
  selectedGroupName?: string;
  ownerId?: string;
}

export function SegmentFilterPropertyPicker({
  options,
  onSelect,
  triggerLabel = "Thêm bộ lọc",
  className,
  showPlus = true,
  selectedProperty,
  selectedValues = [],
  selectedGroupName,
  ownerId,
}: SegmentFilterPropertyPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim().toLocaleLowerCase("vi-VN");

  const filteredProperties = useMemo(
    () =>
      SEGMENT_PROPERTIES.filter(
        (property) => !isClassificationProperty(property),
      ).filter((property) =>
        SEGMENT_PROPERTY_CONFIG[property].label
          .toLocaleLowerCase("vi-VN")
          .includes(normalizedSearch),
      ),
    [normalizedSearch],
  );

  const classificationSections = useMemo(
    () =>
      CLASSIFICATION_PROPERTIES.map((property) => {
        const propertyLabel = SEGMENT_PROPERTY_CONFIG[property].label;
        const propertyMatchesSearch = propertyLabel
          .toLocaleLowerCase("vi-VN")
          .includes(normalizedSearch);
        const groups = getClassificationGroups(property, options).filter(
          (group) =>
            propertyMatchesSearch ||
            group.label.toLocaleLowerCase("vi-VN").includes(normalizedSearch) ||
            group.options.some((option) =>
              option.label
                .toLocaleLowerCase("vi-VN")
                .includes(normalizedSearch),
            ),
        );

        return {
          property,
          label: propertyLabel,
          groups,
        };
      }).filter((section) => section.groups.length > 0),
    [normalizedSearch, options],
  );

  const hasResults =
    filteredProperties.length > 0 || classificationSections.length > 0;

  const handleOpenChange = (nextIsOpen: boolean) => {
    setIsOpen(nextIsOpen);
    if (!nextIsOpen) setSearch("");
  };

  const handleSelect = (
    property: StudentSegmentProperty,
    values?: string[],
    groupName?: string,
  ) => {
    onSelect(property, values, groupName);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <OverlayWrapper isOpen={isOpen} onOpenChange={handleOpenChange}>
      <Button
        variant="primary"
        appearance="outline"
        size="md"
        className={cn(
          "bg-card-surface-area",
          !showPlus && "justify-between text-left font-normal",
          className,
        )}
      >
        {showPlus ? <Plus size={17} aria-hidden="true" /> : null}
        {triggerLabel}
        {!showPlus ? <ChevronDown size={16} aria-hidden="true" /> : null}
      </Button>

      <Popover
        placement="bottom"
        {...(ownerId ? { "data-condition-owner": ownerId } : {})}
        className="w-[min(24rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-card-border bg-card-surface-area p-0 shadow-lg"
      >
        <div className="border-b border-card-border p-3">
          <div className="relative">
            <Search1
              size={16}
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-icon-tertiary"
            />
            <Input
              autoFocus
              aria-label="Tìm thuộc tính học sinh"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm thuộc tính học sinh"
              className="h-9 w-full rounded-lg py-1.5 pl-9 pr-3 text-sm"
            />
          </div>
        </div>

        <div className="max-h-[min(24rem,calc(100dvh-7rem))] overflow-y-auto px-1.5 py-2">
          {hasResults ? (
            <div className="space-y-0.5">
              {filteredProperties.map((property) => (
                <Button
                  key={property}
                  variant="primary"
                  appearance="ghost"
                  size="md"
                  aria-pressed={selectedProperty === property}
                  className="h-auto w-full justify-between rounded-md px-2.5 py-1.5 text-left font-semibold text-text-secondary hover:bg-background-gray-secondary_alt hover:text-text-primary"
                  onPress={() => handleSelect(property)}
                >
                  {SEGMENT_PROPERTY_CONFIG[property].label}
                  {selectedProperty === property &&
                  selectedProperty !== undefined ? (
                    <Check size={16} aria-hidden="true" />
                  ) : null}
                </Button>
              ))}

              {classificationSections.map((section) => (
                <section
                  key={section.property}
                  aria-labelledby={`segment-classification-${section.property}`}
                >
                  <h3
                    id={`segment-classification-${section.property}`}
                    className="px-2.5 pt-2 pb-1 text-sm font-semibold text-text-primary"
                  >
                    {section.label}
                  </h3>
                  {section.groups.map((group) => (
                    <Button
                      key={group.groupName}
                      variant="primary"
                      appearance="ghost"
                      size="md"
                      aria-pressed={
                        selectedProperty === section.property &&
                        (selectedGroupName === group.groupName ||
                          (!selectedGroupName &&
                            group.options.every((option) =>
                              selectedValues.includes(option.value),
                            )))
                      }
                      className="h-auto w-full justify-between rounded-md py-1.5 pr-2.5 pl-5 text-left font-normal text-text-secondary hover:bg-background-gray-secondary_alt hover:text-text-primary"
                      onPress={() =>
                        handleSelect(section.property, [], group.groupName)
                      }
                    >
                      {group.label}
                      {selectedProperty === section.property &&
                      (selectedGroupName === group.groupName ||
                        (!selectedGroupName &&
                          group.options.every((option) =>
                            selectedValues.includes(option.value),
                          ))) ? (
                        <Check size={16} aria-hidden="true" />
                      ) : null}
                    </Button>
                  ))}
                </section>
              ))}
            </div>
          ) : (
            <p className="px-3 py-8 text-center text-sm text-text-tertiary">
              Không tìm thấy thuộc tính phù hợp.
            </p>
          )}
        </div>
      </Popover>
    </OverlayWrapper>
  );
}
