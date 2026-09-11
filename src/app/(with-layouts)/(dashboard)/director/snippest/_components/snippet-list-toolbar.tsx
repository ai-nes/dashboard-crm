"use client";

import { Filter, Search1 } from "@tailgrids/icons";
import { Tab, TabList, Tabs } from "react-aria-components";

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

interface SnippetListToolbarProps {
  showOwnershipTabs: boolean;
  scope: "all" | "mine";
  allCount: number;
  mineCount: number;
  search: string;
  owner: string;
  owners: string[];
  sharing: "all" | "public" | "private";
  resultCount: number;
  totalCount: number;
  onScopeChange: (value: "all" | "mine") => void;
  onSearchChange: (value: string) => void;
  onOwnerChange: (value: string) => void;
  onSharingChange: (value: "all" | "public" | "private") => void;
  onReset: () => void;
}

export default function SnippetListToolbar({
  showOwnershipTabs,
  scope,
  allCount,
  mineCount,
  search,
  owner,
  owners,
  sharing,
  resultCount,
  totalCount,
  onScopeChange,
  onSearchChange,
  onOwnerChange,
  onSharingChange,
  onReset,
}: SnippetListToolbarProps) {
  const hasFilter =
    (showOwnershipTabs && scope !== "all") ||
    Boolean(search.trim()) ||
    owner !== "all" ||
    sharing !== "all";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-card-border px-5 py-4">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2.5">
        {showOwnershipTabs ? (
          <Tabs
            selectedKey={scope}
            onSelectionChange={(key) =>
              onScopeChange(String(key) as "all" | "mine")
            }
            className="shrink-0"
          >
            <TabList
              aria-label="Phạm vi snippet"
              className="flex items-center gap-1 rounded-lg bg-background-gray-secondary p-1"
            >
              <Tab
                id="all"
                className="group flex min-h-8 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-text-secondary outline-none transition-colors hover:text-text-primary data-[selected]:bg-background-white-primary data-[selected]:font-semibold data-[selected]:text-text-primary data-[selected]:shadow-xs data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-[-2px] data-[focus-visible]:outline-primary-500"
              >
                Tất cả
                <span className="text-xs tabular-nums text-text-tertiary group-data-[selected]:text-text-secondary">
                  {allCount}
                </span>
              </Tab>
              <Tab
                id="mine"
                className="group flex min-h-8 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-text-secondary outline-none transition-colors hover:text-text-primary data-[selected]:bg-background-white-primary data-[selected]:font-semibold data-[selected]:text-text-primary data-[selected]:shadow-xs data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-[-2px] data-[focus-visible]:outline-primary-500"
              >
                Của tôi
                <span className="text-xs tabular-nums text-text-tertiary group-data-[selected]:text-text-secondary">
                  {mineCount}
                </span>
              </Tab>
            </TabList>
          </Tabs>
        ) : null}

        <InputGroup className="h-10 w-full sm:w-[22rem]">
          <InputGroupAddon
            align="inline-start"
            className="pr-0 text-text-tertiary"
          >
            <Search1 size={18} aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            aria-label="Tìm snippet"
            placeholder="Tìm theo mã, tên hoặc nội dung..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="pl-2 text-sm"
          />
        </InputGroup>

        <Select
          aria-label="Lọc theo quyền chia sẻ"
          className="min-w-0 sm:w-48"
          value={sharing}
          onChange={(value) =>
            onSharingChange(
              String(value ?? "all") as "all" | "public" | "private",
            )
          }
        >
          <SelectTrigger size="sm" className="w-full">
            <Filter
              size={15}
              className="shrink-0 text-icon-tertiary"
              aria-hidden="true"
            />
            <SelectValue />
            <SelectIndicator />
          </SelectTrigger>
          <SelectContent>
            <SelectItem id="all" textValue="Tất cả quyền chia sẻ">
              Tất cả quyền chia sẻ
            </SelectItem>
            <SelectItem id="public" textValue="Công khai">
              Công khai
            </SelectItem>
            <SelectItem id="private" textValue="Riêng tư">
              Riêng tư
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          aria-label="Lọc theo chủ sở hữu"
          className="min-w-0 sm:w-56"
          value={owner}
          onChange={(value) => onOwnerChange(String(value ?? "all"))}
        >
          <SelectTrigger size="sm" className="w-full">
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
          <span className="font-semibold text-text-primary">{resultCount}</span>{" "}
          / {totalCount} snippet
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
