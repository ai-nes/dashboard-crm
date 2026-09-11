"use client";

import { Filter, Search1 } from "@tailgrids/icons";

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

interface MessageTemplateListToolbarProps {
  search: string;
  owner: string;
  owners: string[];
  resultCount: number;
  totalCount: number;
  onSearchChange: (value: string) => void;
  onOwnerChange: (value: string) => void;
  onReset: () => void;
}

export default function MessageTemplateListToolbar({
  search,
  owner,
  owners,
  resultCount,
  totalCount,
  onSearchChange,
  onOwnerChange,
  onReset,
}: MessageTemplateListToolbarProps) {
  const hasFilter = Boolean(search.trim()) || owner !== "all";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-card-border px-5 py-4">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2.5">
        <InputGroup className="h-10 w-full sm:w-[26rem]">
          <InputGroupAddon align="inline-start" className="pr-0 text-text-tertiary">
            <Search1 size={18} aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            aria-label="Tìm mẫu tin nhắn"
            placeholder="Tìm theo mã hoặc tên mẫu..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="pl-2 text-sm"
          />
        </InputGroup>

        <Select
          aria-label="Lọc theo chủ sở hữu"
          className="min-w-0 sm:w-56"
          value={owner}
          onChange={(value) => onOwnerChange(String(value ?? "all"))}
        >
          <SelectTrigger size="sm" className="w-full">
            <Filter size={15} className="shrink-0 text-icon-tertiary" aria-hidden="true" />
            <SelectValue />
            <SelectIndicator />
          </SelectTrigger>
          <SelectContent>
            <SelectItem id="all" textValue="Tất cả chủ sở hữu">
              Tất cả chủ sở hữu
            </SelectItem>
            {owners.map((ownerName) => (
              <SelectItem key={ownerName} id={ownerName} textValue={ownerName}>
                {ownerName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p aria-live="polite" className="text-xs text-text-tertiary">
          <span className="font-semibold text-text-primary">{resultCount}</span> / {totalCount} mẫu
        </p>
        {hasFilter ? (
          <Button
            size="sm"
            variant="ghost"
            appearance="ghost"
            onPress={onReset}
          >
            Xóa bộ lọc
          </Button>
        ) : null}
      </div>
    </div>
  );
}
