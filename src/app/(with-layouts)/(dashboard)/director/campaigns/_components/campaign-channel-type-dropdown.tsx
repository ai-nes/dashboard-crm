"use client";

import { Check, ChevronDown, Search1 } from "@tailgrids/icons";
import { useDeferredValue, useMemo, useRef, useState } from "react";
import {
  ListBox,
  ListBoxItem,
  Popover,
  type Key,
} from "react-aria-components";

import { Button } from "@/components/tailgrids/core/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/tailgrids/core/input-group";
import { cn } from "@/utils/cn";

import type { ChannelTypeOption, ChannelTypeValue } from "./channel-types";

interface CampaignChannelTypeDropdownProps {
  ariaLabel: string;
  isDisabled?: boolean;
  onChange: (value: ChannelTypeValue | "") => void;
  options: readonly ChannelTypeOption[];
  value: ChannelTypeValue | "";
}

function normalizeSearchValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLocaleLowerCase("vi-VN")
    .trim();
}

export default function CampaignChannelTypeDropdown({
  ariaLabel,
  isDisabled = false,
  onChange,
  options,
  value,
}: CampaignChannelTypeDropdownProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const selectedOption = options.find(
    (option) => option.code.toLowerCase() === value.toLowerCase(),
  );

  const visibleOptions = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(deferredQuery);
    if (!normalizedQuery) return options;

    return options.filter((option) =>
      normalizeSearchValue(option.displayName).includes(normalizedQuery),
    );
  }, [deferredQuery, options]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) setQuery("");
  };

  const handleSelectionChange = (keys: "all" | Set<Key>) => {
    if (keys === "all") return;
    const selectedKey = Array.from(keys)[0];
    if (selectedKey === undefined) return;

    onChange(String(selectedKey) as ChannelTypeValue);
    handleOpenChange(false);
  };

  return (
    <div
      ref={triggerRef}
      className="relative mt-1.5 min-w-0"
      data-campaign-channel-type-dropdown
    >
      <Button
        type="button"
        appearance="outline"
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="h-9 w-full min-w-0 justify-between border-card-border bg-background-white-secondary px-3 py-2 text-left text-sm font-normal shadow-xs"
        isDisabled={isDisabled}
        onPress={() => setIsOpen((open) => !open)}
      >
        <span className="min-w-0 truncate">
          {selectedOption?.displayName ?? "Chọn loại kênh"}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-text-tertiary transition-transform",
            isOpen && "rotate-180",
          )}
          aria-hidden="true"
        />
      </Button>

      {isOpen && (
        <Popover
          aria-label={`Danh sách ${ariaLabel.toLocaleLowerCase("vi-VN")}`}
          className="z-50 w-(--trigger-width) overflow-hidden rounded-lg border border-card-border bg-background-white-secondary shadow-md"
          data-campaign-channel-type-dropdown
          isNonModal
          isOpen
          onOpenChange={handleOpenChange}
          placement="bottom start"
          triggerRef={triggerRef}
        >
          <div className="border-b border-card-border p-1.5">
            <InputGroup className="h-8 rounded-md">
              <InputGroupAddon className="px-2 text-text-tertiary">
                <Search1 size={14} aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                autoFocus
                aria-label={`Tìm ${ariaLabel.toLocaleLowerCase("vi-VN")}`}
                className="h-8 py-1 text-xs"
                placeholder="Tìm kiếm..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </InputGroup>
          </div>

          <ListBox
            aria-label={`Danh sách ${ariaLabel.toLocaleLowerCase("vi-VN")}`}
            className="max-h-64 overflow-auto p-1.5 outline-none"
            items={visibleOptions}
            selectedKeys={selectedOption ? new Set([selectedOption.code]) : new Set()}
            selectionMode="single"
            onSelectionChange={handleSelectionChange}
          >
            {(option) => (
              <ListBoxItem
                id={option.code}
                textValue={option.displayName}
                className="group/item relative flex w-full cursor-pointer items-center gap-3 rounded-md py-1.5 pr-8 pl-2 text-sm text-text-secondary outline-hidden select-none focus:bg-background-gray-secondary_alt focus:text-text-primary data-disabled:pointer-events-none data-disabled:text-input-disabled-text"
              >
                <span className="min-w-0 truncate text-text-primary">
                  {option.displayName}
                </span>
                {option.code.toLowerCase() === value.toLowerCase() && (
                  <span className="absolute right-1.5 flex size-5 items-center justify-center text-text-primary">
                    <Check size={14} aria-hidden="true" />
                  </span>
                )}
              </ListBoxItem>
            )}
          </ListBox>

          {visibleOptions.length === 0 && (
            <p className="px-3 py-4 text-center text-sm text-text-tertiary">
              Không tìm thấy kết quả phù hợp.
            </p>
          )}
        </Popover>
      )}
    </div>
  );
}
