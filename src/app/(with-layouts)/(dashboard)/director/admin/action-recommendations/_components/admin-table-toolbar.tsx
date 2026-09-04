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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";

import type { SelectOption } from "./types";

interface AdminTableToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  searchLabel: string;
  filters?: Array<{
    label: string;
    value: string;
    options: SelectOption[];
    onChange: (value: string) => void;
  }>;
}

export default function AdminTableToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  searchLabel,
  filters = [],
}: AdminTableToolbarProps) {
  return (
    <div className="flex flex-col gap-2.5 border-b border-card-border px-4 py-3 sm:flex-row sm:items-center">
      <InputGroup className="h-9 min-w-0 flex-1 sm:max-w-lg">
        <InputGroupAddon align="inline-start" className="pr-0 text-icon-tertiary">
          <Search1 size={17} aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput
          aria-label={searchLabel}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          className="pl-2 text-sm"
        />
      </InputGroup>

      {filters.map((filter) => (
        <Select
          key={filter.label}
          aria-label={filter.label}
          value={filter.value}
          onChange={(value) => filter.onChange(String(value))}
          className="w-full sm:w-44"
        >
          <SelectTrigger size="sm" className="h-9 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {filter.options.map((option) => (
              <SelectItem key={option.id} id={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  );
}

