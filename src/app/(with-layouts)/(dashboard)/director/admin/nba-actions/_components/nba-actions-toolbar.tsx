"use client";

import { Search1 } from "@tailgrids/icons";

import { Button } from "@/components/tailgrids/core/button";
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
import type { NbaActionType } from "@/services/api/nba-actions";

import type { EnabledFilter } from "./types";

interface NbaActionsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  actionType: string;
  onActionTypeChange: (value: string) => void;
  enabled: EnabledFilter;
  onEnabledChange: (value: EnabledFilter) => void;
  actionTypes: NbaActionType[];
  total: number;
  resultCount: number;
  isFetching: boolean;
  onReset: () => void;
}

const enabledOptions: Array<{ id: EnabledFilter; label: string }> = [
  { id: "all", label: "Tất cả trạng thái" },
  { id: "enabled", label: "Đang bật" },
  { id: "disabled", label: "Đang tắt" },
];

export default function NbaActionsToolbar({
  search,
  onSearchChange,
  actionType,
  onActionTypeChange,
  enabled,
  onEnabledChange,
  actionTypes,
  total,
  resultCount,
  isFetching,
  onReset,
}: NbaActionsToolbarProps) {
  const hasFilters = Boolean(search || actionType !== "all" || enabled !== "all");

  return (
    <div className="space-y-4 border-b border-card-border p-4 lg:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-text-primary">
            Danh sách Action
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            {total} Action trong danh mục
          </p>
        </div>
        <span
          className="shrink-0 text-xs text-text-tertiary"
          aria-live="polite"
          aria-busy={isFetching || undefined}
        >
          {isFetching ? "Đang cập nhật…" : `${resultCount} kết quả`}
        </span>
      </div>

      <InputGroup>
        <InputGroupAddon align="inline-start">
          <Search1 size={18} aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput
          aria-label="Tìm Action theo mã hoặc tên"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Tìm theo mã hoặc tên Action"
        />
      </InputGroup>

      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          value={actionType}
          onChange={(value) => onActionTypeChange(String(value))}
          aria-label="Lọc theo loại Action"
        >
          <SelectTrigger size="sm" className="w-full">
            <SelectValue />
            <SelectIndicator />
          </SelectTrigger>
          <SelectContent>
            <SelectItem id="all" textValue="Tất cả loại Action">
              Tất cả loại Action
            </SelectItem>
            {actionTypes.map((type) => (
              <SelectItem
                key={type.name}
                id={type.name}
                textValue={type.displayName}
              >
                {type.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={enabled}
          onChange={(value) => onEnabledChange(String(value) as EnabledFilter)}
          aria-label="Lọc theo trạng thái Action"
        >
          <SelectTrigger size="sm" className="w-full">
            <SelectValue />
            <SelectIndicator />
          </SelectTrigger>
          <SelectContent>
            {enabledOptions.map((option) => (
              <SelectItem key={option.id} id={option.id} textValue={option.label}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <Button
          type="button"
          size="xs"
          variant="ghost"
          appearance="ghost"
          onPress={onReset}
          className="-ml-2"
        >
          Xóa bộ lọc
        </Button>
      )}
    </div>
  );
}
