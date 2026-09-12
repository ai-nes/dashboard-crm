"use client";

import { Filter, Search1 } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
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
import { cn } from "@/utils/cn";

const countBadgeClassName =
  "min-w-5 justify-center border border-card-border bg-background-white-primary px-1.5 tabular-nums text-text-secondary";

interface MessageTemplateListToolbarProps {
  showOwnershipTabs: boolean;
  scope: "all" | "mine";
  allCount: number;
  mineCount: number;
  search: string;
  owner: string;
  owners: Array<{ id: string; name: string }>;
  resultCount: number;
  totalCount: number;
  onScopeChange: (value: "all" | "mine") => void;
  onSearchChange: (value: string) => void;
  onOwnerChange: (value: string) => void;
  onReset: () => void;
}

export default function MessageTemplateListToolbar({
  showOwnershipTabs,
  scope,
  allCount,
  mineCount,
  search,
  owner,
  owners,
  resultCount,
  totalCount,
  onScopeChange,
  onSearchChange,
  onOwnerChange,
  onReset,
}: MessageTemplateListToolbarProps) {
  const hasFilter =
    (showOwnershipTabs && scope !== "all") ||
    Boolean(search.trim()) ||
    owner !== "all";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-card-border px-5 py-4">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2.5">
        <InputGroup className="h-10 w-full sm:w-[26rem]">
          <InputGroupAddon
            align="inline-start"
            className="pr-0 text-text-tertiary"
          >
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

        <div
          role="group"
          aria-label="Phạm vi và chủ sở hữu mẫu email"
          className="flex w-full flex-wrap items-center gap-1 rounded-lg bg-background-gray-secondary p-1 sm:w-auto sm:flex-nowrap"
        >
          <Select
            aria-label="Lọc theo chủ sở hữu"
            className="min-w-0 flex-1 sm:w-auto sm:flex-none"
            value={owner}
            onChange={(value) => onOwnerChange(String(value ?? "all"))}
          >
            <SelectTrigger
              size="sm"
              className={cn(
                "h-8 w-full min-w-32 rounded-md border-0 bg-transparent px-2.5 shadow-none",
                scope === "all" &&
                  "bg-background-white-primary font-semibold text-text-primary shadow-xs",
              )}
            >
              <Filter
                size={15}
                className="shrink-0 text-icon-tertiary"
                aria-hidden="true"
              />
              <SelectValue className="flex min-w-0 items-center gap-2">
                <span className="max-w-40 truncate">
                  {owner === "all"
                    ? "Tất cả"
                    : (owners.find((item) => item.id === owner)?.name ?? owner)}
                </span>
                {owner === "all" ? (
                  <Badge color="gray" size="sm" className={countBadgeClassName}>
                    {allCount}
                  </Badge>
                ) : null}
              </SelectValue>
              <SelectIndicator />
            </SelectTrigger>
            <SelectContent>
              <SelectItem id="all" textValue="Tất cả">
                Tất cả
              </SelectItem>
              {owners.map((ownerOption) => (
                <SelectItem
                  key={ownerOption.id}
                  id={ownerOption.id}
                  textValue={ownerOption.name}
                >
                  {ownerOption.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {showOwnershipTabs ? (
            <Button
              size="sm"
              variant="ghost"
              appearance="ghost"
              aria-pressed={scope === "mine"}
              onPress={() => onScopeChange("mine")}
              className={cn(
                "h-8 shrink-0 gap-2 rounded-md px-2.5 text-sm font-medium text-text-secondary",
                scope === "mine" &&
                  "bg-background-white-primary font-semibold text-text-primary shadow-xs",
              )}
            >
              Của tôi
              <Badge color="gray" size="sm" className={countBadgeClassName}>
                {mineCount}
              </Badge>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p aria-live="polite" className="text-xs text-text-tertiary">
          <span className="font-semibold text-text-primary">{resultCount}</span>{" "}
          / {totalCount} mẫu
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
