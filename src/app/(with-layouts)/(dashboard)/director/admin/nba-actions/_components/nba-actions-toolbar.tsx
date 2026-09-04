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

import type { ChannelFilter, EnabledFilter } from "./types";

interface NbaActionsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  actionType: string;
  onActionTypeChange: (value: string) => void;
  channel: ChannelFilter;
  onChannelChange: (value: ChannelFilter) => void;
  enabled: EnabledFilter;
  onEnabledChange: (value: EnabledFilter) => void;
  actionTypes: NbaActionType[];
  total: number;
  resultCount: number;
  isFetching: boolean;
  onReset: () => void;
  canEdit: boolean;
  onCreateAction: () => void;
}

const enabledOptions: Array<{ id: EnabledFilter; label: string }> = [
  { id: "all", label: "Tất cả trạng thái" },
  { id: "enabled", label: "Đang bật" },
  { id: "disabled", label: "Đang tắt" },
];

const channelOptions: Array<{ id: ChannelFilter; label: string }> = [
  { id: "all", label: "Tất cả kênh" },
  { id: "CALL", label: "Cuộc gọi" },
  { id: "EMAIL", label: "Email" },
  { id: "MESSAGE", label: "Tin nhắn" },
  { id: "NONE", label: "Không có kênh" },
];

export default function NbaActionsToolbar({
  search,
  onSearchChange,
  actionType,
  onActionTypeChange,
  channel,
  onChannelChange,
  enabled,
  onEnabledChange,
  actionTypes,
  total,
  resultCount,
  isFetching,
  onReset,
  canEdit,
  onCreateAction,
}: NbaActionsToolbarProps) {
  const hasFilters = Boolean(search || actionType !== "all" || channel !== "all" || enabled !== "all");

  return (
    <div className="space-y-4 border-b border-card-border p-4 lg:p-5">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-[-0.2px] text-text-primary">
            Danh sách hành động NBA
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            {total} hành động trong quy trình tuyển sinh
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="text-xs text-text-tertiary" aria-live="polite" aria-busy={isFetching || undefined}>{isFetching ? "Đang cập nhật…" : `${resultCount} hành động`}</span>
          {canEdit && <Button type="button" size="sm" onPress={onCreateAction}>Tạo Action</Button>}
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <InputGroup className="min-w-0 lg:max-w-[60rem] lg:flex-1">
          <InputGroupAddon align="inline-start">
            <Search1 size={18} aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            aria-label="Tìm hành động theo mã hoặc tên"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Tìm theo mã hoặc tên hành động"
          />
        </InputGroup>

        <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
          <Select
            value={actionType}
            onChange={(value) => onActionTypeChange(String(value))}
            aria-label="Lọc theo nhóm hành động"
            className="min-w-0 sm:w-48"
          >
            <SelectTrigger size="sm" className="w-full">
              <SelectValue />
              <SelectIndicator />
            </SelectTrigger>
            <SelectContent>
              <SelectItem id="all" textValue="Tất cả nhóm hành động">
                Tất cả nhóm hành động
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
            value={channel}
            onChange={(value) => onChannelChange(String(value) as ChannelFilter)}
            aria-label="Lọc theo kênh hành động"
            className="min-w-0 sm:w-40"
          >
            <SelectTrigger size="sm" className="w-full">
              <SelectValue />
              <SelectIndicator />
            </SelectTrigger>
            <SelectContent>
              {channelOptions.map((option) => (
                <SelectItem key={option.id} id={option.id} textValue={option.label}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={enabled}
            onChange={(value) => onEnabledChange(String(value) as EnabledFilter)}
            aria-label="Lọc theo trạng thái hành động"
            className="min-w-0 sm:w-48"
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

          {hasFilters && (
            <Button
              type="button"
              size="xs"
              variant="ghost"
              appearance="ghost"
              onPress={onReset}
              className="shrink-0 self-center"
            >
              Xóa lọc
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
