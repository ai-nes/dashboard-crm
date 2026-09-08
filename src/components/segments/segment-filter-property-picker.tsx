"use client";

import { Plus, Search1 } from "@tailgrids/icons";
import { useMemo, useState } from "react";

import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { OverlayWrapper } from "@/components/tailgrids/core/overlay";
import { Popover } from "@/components/tailgrids/core/popover";
import { cn } from "@/utils/cn";

import {
  SEGMENT_FILTER_CATEGORIES,
  SEGMENT_FILTER_CATEGORY_LABEL,
  SEGMENT_PROPERTIES,
  SEGMENT_PROPERTY_CONFIG,
  type StudentSegmentProperty,
} from "./segment-filter-config";

interface SegmentFilterPropertyPickerProps {
  onSelect: (property: StudentSegmentProperty) => void;
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
  const propertiesByCategory = useMemo(
    () =>
      SEGMENT_FILTER_CATEGORIES.map((category) => ({
        category,
        properties: SEGMENT_PROPERTIES.filter((property) => {
          const config = SEGMENT_PROPERTY_CONFIG[property];
          return (
            config.category === category &&
            config.label.toLocaleLowerCase("vi-VN").includes(normalizedSearch)
          );
        }),
      })).filter(({ properties }) => properties.length > 0),
    [normalizedSearch],
  );

  const handleOpenChange = (nextIsOpen: boolean) => {
    setIsOpen(nextIsOpen);
    if (!nextIsOpen) setSearch("");
  };

  const handleSelect = (property: StudentSegmentProperty) => {
    onSelect(property);
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
        className="w-[min(32rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-card-border bg-card-surface-area p-0 shadow-lg"
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

        <div className="max-h-[min(28rem,calc(100dvh-7rem))] overflow-y-auto px-1.5 py-2">
          {propertiesByCategory.length > 0 ? (
            propertiesByCategory.map(({ category, properties }) => (
              <section
                key={category}
                aria-labelledby={`segment-category-${category}`}
              >
                <h3
                  id={`segment-category-${category}`}
                  className="px-2.5 py-1.5 text-sm font-semibold text-text-primary"
                >
                  {SEGMENT_FILTER_CATEGORY_LABEL[category]}
                </h3>
                <div className="space-y-0.5">
                  {properties.map((property) => (
                    <Button
                      key={property}
                      variant="primary"
                      appearance="ghost"
                      size="md"
                      className="h-auto w-full justify-start rounded-md px-2.5 py-1.5 text-left font-normal text-text-secondary hover:bg-background-gray-secondary_alt hover:text-text-primary"
                      onPress={() => handleSelect(property)}
                    >
                      <span>{SEGMENT_PROPERTY_CONFIG[property].label}</span>
                    </Button>
                  ))}
                </div>
              </section>
            ))
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
