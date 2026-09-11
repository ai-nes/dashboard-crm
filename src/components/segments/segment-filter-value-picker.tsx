"use client";

import { Check, Search1 } from "@tailgrids/icons";
import { useMemo, useState } from "react";

import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { OverlayWrapper } from "@/components/tailgrids/core/overlay";
import { Popover } from "@/components/tailgrids/core/popover";
import { cn } from "@/utils/cn";

import {
  getOptionsForSelectedClassificationGroup,
  getSelectedOptionLabels,
  type SegmentConditionValue,
  type SegmentOption,
} from "./segment-filter-config";

interface SegmentFilterValuePickerProps {
  ownerId: string;
  label: string;
  options: SegmentOption[];
  value: SegmentConditionValue;
  selectedGroupName?: string;
  onChange: (value: string[]) => void;
}

export function SegmentFilterValuePicker({
  ownerId,
  label,
  options,
  value,
  selectedGroupName,
  onChange,
}: SegmentFilterValuePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selectedValues = useMemo(
    () => (Array.isArray(value) ? value : []),
    [value],
  );
  const normalizedSearch = search.trim().toLocaleLowerCase("vi-VN");
  const visibleOptions = useMemo(
    () =>
      getOptionsForSelectedClassificationGroup(
        selectedValues,
        options,
        selectedGroupName,
      ),
    [options, selectedGroupName, selectedValues],
  );
  const filteredOptions = useMemo(
    () =>
      visibleOptions.filter((option) =>
        option.label.toLocaleLowerCase("vi-VN").includes(normalizedSearch),
      ),
    [normalizedSearch, visibleOptions],
  );

  const selectedLabels = getSelectedOptionLabels(selectedValues, options);

  const handleOpenChange = (nextIsOpen: boolean) => {
    setIsOpen(nextIsOpen);
    if (!nextIsOpen) setSearch("");
  };

  const toggleValue = (nextValue: string) => {
    const nextValues = selectedValues.includes(nextValue)
      ? selectedValues.filter((selectedValue) => selectedValue !== nextValue)
      : [...selectedValues, nextValue];
    onChange(nextValues);
  };

  const triggerLabel =
    selectedLabels.length === 0
      ? `Chọn ${label.toLocaleLowerCase("vi-VN")}`
      : selectedLabels.length <= 2
        ? selectedLabels.join(", ")
        : `${selectedLabels.slice(0, 2).join(", ")} +${selectedLabels.length - 2}`;

  return (
    <OverlayWrapper isOpen={isOpen} onOpenChange={handleOpenChange}>
      <Button
        variant="primary"
        appearance="outline"
        size="md"
        className="min-w-0 flex-1 justify-between overflow-hidden bg-card-surface-area text-left font-normal"
        aria-label={`Chọn ${label}`}
      >
        <span
          className={cn(
            "truncate",
            selectedLabels.length === 0 && "text-text-tertiary",
          )}
        >
          {triggerLabel}
        </span>
        <span aria-hidden="true" className="shrink-0 text-text-tertiary">
          ▾
        </span>
      </Button>

      <Popover
        data-condition-owner={ownerId}
        placement="bottom start"
        className="w-[min(26rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-card-border bg-card-surface-area p-0 shadow-lg"
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
              aria-label="Tìm giá trị"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm kiếm"
              className="h-10 w-full py-2 pl-9 pr-3 text-sm"
            />
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto p-2">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => {
              const isSelected = selectedValues.includes(option.value);

              return (
                <Button
                  key={option.value}
                  variant="primary"
                  appearance="ghost"
                  size="md"
                  aria-pressed={isSelected}
                  className="h-auto w-full justify-start gap-3 rounded-md px-2.5 py-2 text-left font-normal text-text-secondary hover:bg-background-gray-secondary_alt hover:text-text-primary"
                  onPress={() => toggleValue(option.value)}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded border border-card-border",
                      isSelected &&
                        "border-button-primary-background bg-button-primary-background text-white-100",
                    )}
                  >
                    {isSelected && <Check size={13} />}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {option.label}
                  </span>
                </Button>
              );
            })
          ) : (
            <p className="px-3 py-8 text-center text-sm text-text-tertiary">
              Không tìm thấy giá trị phù hợp.
            </p>
          )}
        </div>
      </Popover>
    </OverlayWrapper>
  );
}
