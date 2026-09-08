"use client";

import { Plus, Search1 } from "@tailgrids/icons";
import { useMemo, useState } from "react";

import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { OverlayWrapper } from "@/components/tailgrids/core/overlay";
import { Popover } from "@/components/tailgrids/core/popover";
import { cn } from "@/utils/cn";

import {
  CASCADING_PROPERTIES,
  CASCADING_PROPERTY_CONFIG,
  SEGMENT_PROPERTIES,
  SEGMENT_PROPERTY_CONFIG,
  isCascadingProperty,
  type StudentSegmentProperty,
} from "./segment-filter-config";

interface SegmentFilterPropertyPickerProps {
  onSelect: (property: StudentSegmentProperty, category?: string) => void;
  triggerLabel?: string;
  className?: string;
}

export function SegmentFilterPropertyPicker({
  onSelect,
  triggerLabel = "Thêm bộ lọc",
  className,
}: SegmentFilterPropertyPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const normalizedSearch = search.trim().toLocaleLowerCase("vi-VN");

  const filteredProperties = useMemo(
    () =>
      SEGMENT_PROPERTIES.filter(
        (property) => !isCascadingProperty(property),
      ).filter((property) =>
        SEGMENT_PROPERTY_CONFIG[property].label
          .toLocaleLowerCase("vi-VN")
          .includes(normalizedSearch),
      ),
    [normalizedSearch],
  );

  const cascadingSections = useMemo(
    () =>
      CASCADING_PROPERTIES.map((property) => {
        const config = CASCADING_PROPERTY_CONFIG[property]!;
        const propertyLabel = SEGMENT_PROPERTY_CONFIG[property].label;
        const propertyMatchesSearch = propertyLabel
          .toLocaleLowerCase("vi-VN")
          .includes(normalizedSearch);

        return {
          property,
          label: propertyLabel,
          categories: propertyMatchesSearch
            ? config.categoryOptions
            : config.categoryOptions.filter((option) =>
                option.label
                  .toLocaleLowerCase("vi-VN")
                  .includes(normalizedSearch),
              ),
        };
      }).filter((section) => section.categories.length > 0),
    [normalizedSearch],
  );

  const hasResults =
    filteredProperties.length > 0 || cascadingSections.length > 0;

  const handleOpenChange = (nextIsOpen: boolean) => {
    setIsOpen(nextIsOpen);
    if (!nextIsOpen) setSearch("");
  };

  const handleSelect = (
    property: StudentSegmentProperty,
    category?: string,
  ) => {
    onSelect(property, category);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <OverlayWrapper isOpen={isOpen} onOpenChange={handleOpenChange}>
      <Button
        variant="primary"
        appearance="outline"
        size="md"
        className={cn("bg-card-surface-area", className)}
      >
        <Plus size={17} aria-hidden="true" />
        {triggerLabel}
      </Button>

      <Popover
        placement="bottom"
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
                  className="h-auto w-full justify-start rounded-md px-2.5 py-1.5 text-left font-semibold text-text-secondary hover:bg-background-gray-secondary_alt hover:text-text-primary"
                  onPress={() => handleSelect(property)}
                >
                  <span>{SEGMENT_PROPERTY_CONFIG[property].label}</span>
                </Button>
              ))}

              {cascadingSections.map((section) => (
                <section
                  key={section.property}
                  aria-labelledby={`segment-cascading-${section.property}`}
                >
                  <h3
                    id={`segment-cascading-${section.property}`}
                    className="px-2.5 pt-2 pb-1 text-sm font-semibold text-text-primary"
                  >
                    {section.label}
                  </h3>
                  {section.categories.map((option) => (
                    <Button
                      key={option.value}
                      variant="primary"
                      appearance="ghost"
                      size="md"
                      className="h-auto w-full justify-start rounded-md py-1.5 pr-2.5 pl-5 text-left font-normal text-text-secondary hover:bg-background-gray-secondary_alt hover:text-text-primary"
                      onPress={() =>
                        handleSelect(section.property, option.value)
                      }
                    >
                      <span>{option.label}</span>
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
