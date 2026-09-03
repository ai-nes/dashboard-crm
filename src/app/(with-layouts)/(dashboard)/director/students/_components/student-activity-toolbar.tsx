"use client";

import { Plus, Search1 } from "@tailgrids/icons";

import { Button } from "@/components/tailgrids/core/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/tailgrids/core/input-group";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";

export type ActivityExpansionMode = "collapse" | "expand";

export interface ActivityFilterOption {
  id: string;
  label: string;
}

interface StudentActivityToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  searchLabel: string;
  expansionMode: ActivityExpansionMode;
  onExpansionModeChange: (value: ActivityExpansionMode) => void;
  onCreate?: () => void;
  createLabel?: string;
}

export default function StudentActivityToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  searchLabel,
  expansionMode,
  onExpansionModeChange,
  onCreate,
  createLabel,
}: StudentActivityToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <InputGroup className="h-11 w-full min-w-0 max-w-md rounded-full">
        <InputGroupInput
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchLabel}
          className="pl-4 text-base"
        />
        <InputGroupAddon align="inline-end" className="px-4 text-text-primary">
          <Search1 size={20} />
        </InputGroupAddon>
      </InputGroup>

      <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
        {onCreate && createLabel ? (
          <Button size="sm" className="shrink-0" onPress={onCreate}>
            <Plus size={16} />
            {createLabel}
          </Button>
        ) : null}
        <Select
          value={expansionMode}
          onChange={(key) => onExpansionModeChange(String(key) as ActivityExpansionMode)}
          aria-label="Hiển thị tất cả hoạt động"
          className="w-fit"
        >
          <SelectTrigger
            appearance="ghost"
            className="h-auto min-h-8 justify-start gap-1.5 whitespace-nowrap rounded-lg border-0 bg-transparent px-2 text-sm font-semibold text-text-primary shadow-none hover:bg-background-gray-secondary hover:text-text-primary"
          >
            <SelectValue className="max-w-none text-sm font-semibold text-text-primary" />
            <SelectIndicator className="text-text-primary" />
          </SelectTrigger>
          <SelectContent className="min-w-44">
            <SelectItem id="collapse" textValue="Thu gọn tất cả" className="py-2 whitespace-nowrap">
              Thu gọn tất cả
            </SelectItem>
            <SelectItem id="expand" textValue="Mở rộng tất cả" className="py-2 whitespace-nowrap">
              Mở rộng tất cả
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

interface ActivityFilterSelectProps {
  ariaLabel: string;
  triggerLabel: string;
  value: string;
  options: ActivityFilterOption[];
  onChange: (value: string) => void;
}

export function ActivityFilterSelect({
  ariaLabel,
  triggerLabel,
  value,
  options,
  onChange,
}: ActivityFilterSelectProps) {
  return (
    <Select
      value={value}
      onChange={(key) => onChange(String(key))}
      aria-label={ariaLabel}
      className="min-w-0"
    >
      <SelectTrigger
        appearance="ghost"
        className="h-auto min-h-8 justify-start gap-1.5 rounded-none border-0 bg-transparent p-0 text-base font-semibold text-text-primary shadow-none hover:bg-transparent hover:text-text-primary"
      >
        <SelectValue className="max-w-none text-base font-semibold text-text-primary">
          {({ selectedText }) => (value === "all" ? triggerLabel : selectedText)}
        </SelectValue>
        <SelectIndicator className="text-text-primary" />
      </SelectTrigger>
      <SelectContent className="min-w-44">
        {options.map((option) => (
          <SelectItem key={option.id} id={option.id} textValue={option.label}>
            <span className="whitespace-nowrap">{option.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
