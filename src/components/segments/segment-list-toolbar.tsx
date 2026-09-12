"use client";

import { Search1 } from "@tailgrids/icons";
import type { Table } from "@tanstack/react-table";
import type { ReactNode } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-aria-components";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/tailgrids/core/input-group";
import type { SegmentListItem } from "./segment-list-types";
import { SEGMENT_STATUS_FILTER_OPTIONS } from "./segment-list-types";

interface SegmentListToolbarProps {
  table: Table<SegmentListItem>;
  children: ReactNode;
  serverPagination?: {
    search: string;
    status: string;
    total: number;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: string) => void;
  };
}

export function SegmentListToolbar({
  table,
  children,
  serverPagination,
}: SegmentListToolbarProps) {
  const status = serverPagination
    ? serverPagination.status
    : String(table.getColumn("status")?.getFilterValue() ?? "ALL");
  const segments = table.options.data;
  const tabs = SEGMENT_STATUS_FILTER_OPTIONS.map((option) => ({
    ...option,
    count: serverPagination
      ? option.id === "ALL" || option.id === status
        ? serverPagination.total
        : null
      : option.id === "ALL"
        ? segments.length
        : segments.filter((item) => item.status === option.id).length,
  }));

  return (
    <Tabs
      selectedKey={status}
      onSelectionChange={(key) =>
        serverPagination
          ? serverPagination.onStatusChange(String(key))
          : table
              .getColumn("status")
              ?.setFilterValue(key === "ALL" ? undefined : key)
      }
    >
      <div className="space-y-3 border-b border-card-border px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <InputGroup className="h-10 w-full sm:max-w-md">
            <InputGroupAddon
              align="inline-start"
              className="pr-0 text-text-tertiary"
            >
              <Search1 size={18} aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              type="search"
              aria-label="Tìm segment"
              placeholder="Tìm mã, tên segment hoặc người tạo…"
              value={
                serverPagination
                  ? serverPagination.search
                  : String(table.getState().globalFilter ?? "")
              }
              onChange={(event) =>
                serverPagination
                  ? serverPagination.onSearchChange(event.target.value)
                  : table.setGlobalFilter(event.target.value)
              }
              className="pl-2 text-sm"
            />
          </InputGroup>
          <span aria-live="polite" className="text-xs text-text-tertiary">
            {serverPagination
              ? `${segments.length} / ${serverPagination.total} segments`
              : `${table.getRowModel().rows.length} / ${segments.length} segments`}
          </span>
        </div>
        <TabList
          aria-label="Lọc trạng thái segment"
          className="flex flex-wrap gap-1.5"
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              id={tab.id}
              className="group flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary outline-none hover:bg-background-gray-secondary_alt data-[selected]:bg-badge-primary-background data-[selected]:text-badge-primary-text data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-primary-500"
            >
              {tab.label}
              <span className="rounded-md bg-background-gray-secondary px-1.5 py-0.5 text-xs tabular-nums group-data-[selected]:bg-badge-primary-background group-data-[selected]:text-badge-primary-text">
                {tab.count ?? "—"}
              </span>
            </Tab>
          ))}
        </TabList>
      </div>
      <TabPanel
        id={status}
        className="outline-none focus-visible:outline-2 focus-visible:outline-primary-500"
      >
        {children}
      </TabPanel>
    </Tabs>
  );
}
