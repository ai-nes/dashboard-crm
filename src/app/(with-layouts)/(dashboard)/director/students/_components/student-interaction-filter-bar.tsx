"use client";

import { Search1 } from "@tailgrids/icons";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/tailgrids/core/input-group";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import type { InteractionFeedFilters } from "@/services/api/interaction-intelligence";
import { cn } from "@/utils/cn";

import { interactionChannelOptions } from "./student-interaction-utils";
import type { ActivityExpansionMode } from "./student-activity-toolbar";

type SelectFilterKey = "channel";

interface StudentInteractionFilterBarProps {
  filters: InteractionFeedFilters;
  expansionMode: ActivityExpansionMode;
  search: string;
  onChange: (filters: InteractionFeedFilters) => void;
  onSearchChange: (value: string) => void;
  onExpansionModeChange: (mode: ActivityExpansionMode) => void;
}

export default function StudentInteractionFilterBar({
  filters,
  expansionMode,
  search,
  onChange,
  onSearchChange,
  onExpansionModeChange,
}: StudentInteractionFilterBarProps) {
  const updateSelectFilter = (key: SelectFilterKey, value: string) => {
    updateFilter(key, value === "all" ? undefined : value);
  };

  const updateFilter = (key: SelectFilterKey, value: string | undefined) => {
    const nextFilters = { ...filters };
    if (value) {
      nextFilters[key] = value;
    } else {
      delete nextFilters[key];
    }
    onChange(nextFilters);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-nowrap sm:items-center">
      <InputGroup className="h-11 w-full min-w-0 max-w-md rounded-full">
        <InputGroupInput
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Tìm trong hoạt động..."
          aria-label="Tìm trong tất cả hoạt động"
          className="pl-4 text-base"
        />
        <InputGroupAddon align="inline-end" className="px-4 text-text-primary">
          <Search1 size={20} />
        </InputGroupAddon>
      </InputGroup>

      <div className="flex shrink-0 flex-nowrap items-center gap-1 sm:ml-auto">
        <FilterSelect
          ariaLabel="Lọc hoạt động theo kênh"
          value={filters.channel ?? "all"}
          options={interactionChannelOptions}
          onChange={(value) => updateSelectFilter("channel", value)}
        />
        <ExpansionSelect
          value={expansionMode}
          onChange={onExpansionModeChange}
        />
      </div>
    </div>
  );
}

function ExpansionSelect({
  value,
  onChange,
  className,
}: {
  value: ActivityExpansionMode;
  onChange: (value: ActivityExpansionMode) => void;
  className?: string;
}) {
  return (
    <Select
      value={value}
      onChange={(key) => onChange(String(key) as ActivityExpansionMode)}
      className="w-fit shrink-0"
    >
      <SelectTrigger
        aria-label="Hiển thị tất cả hoạt động"
        appearance="ghost"
        className={cn(
          "h-10 w-fit min-w-40 shrink-0 justify-start whitespace-nowrap rounded-lg border-0 bg-transparent px-2 text-sm font-semibold text-text-primary shadow-none hover:bg-background-gray-secondary",
          className,
        )}
      >
        <SelectValue className="text-sm font-semibold text-text-primary" />
        <SelectIndicator className="text-text-tertiary" />
      </SelectTrigger>
      <SelectContent className="min-w-44">
        <SelectItem
          id="collapse"
          textValue="Thu gọn tất cả"
          className="py-2 whitespace-nowrap"
        >
          Thu gọn tất cả
        </SelectItem>
        <SelectItem
          id="expand"
          textValue="Mở rộng tất cả"
          className="py-2 whitespace-nowrap"
        >
          Mở rộng tất cả
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

function FilterSelect({
  ariaLabel,
  value,
  options,
  onChange,
}: {
  ariaLabel: string;
  value: string;
  options: { id: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <Select
      value={value}
      onChange={(key) => onChange(String(key))}
      className="w-fit"
    >
      <SelectTrigger
        aria-label={ariaLabel}
        appearance="ghost"
        className="h-10 w-fit min-w-0 justify-start whitespace-nowrap rounded-lg border-0 bg-transparent px-2 text-sm shadow-none hover:bg-background-gray-secondary"
      >
        <SelectValue className="text-sm font-medium text-text-primary" />
        <SelectIndicator className="text-text-tertiary" />
      </SelectTrigger>
      <SelectContent className="min-w-52">
        {options.map((option) => (
          <SelectItem key={option.id} id={option.id} textValue={option.label}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
