"use client";

import { Search1 } from "@tailgrids/icons";
import type { ReactNode } from "react";
import type { Table } from "@tanstack/react-table";
import { Tab, TabList, TabPanel, Tabs } from "react-aria-components";
import { Input } from "@/components/tailgrids/core/input";
import type { TeamMember } from "./types";

interface TeamMemberToolbarProps {
  table: Table<TeamMember>;
  leadPicker: ReactNode;
  children: ReactNode;
}

export default function TeamMemberToolbar({
  table,
  leadPicker,
  children,
}: TeamMemberToolbarProps) {
  const role = String(table.getColumn("role")?.getFilterValue() ?? "ALL");
  const members = table.options.data;
  const tabs = [
    { id: "ALL", label: "Tất cả", count: members.length },
    {
      id: "SALE",
      label: "Sale",
      count: members.filter((member) => member.role === "SALE").length,
    },
    {
      id: "CTV_SALE",
      label: "CTV Sale",
      count: members.filter((member) => member.role === "CTV_SALE").length,
    },
  ];
  return (
    <Tabs
      className="space-y-4"
      selectedKey={role}
      onSelectionChange={(key) =>
        table.getColumn("role")?.setFilterValue(key === "ALL" ? undefined : key)
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <label className="relative block w-full sm:max-w-md">
          <span className="sr-only">Tìm thành viên theo tên hoặc email</span>
          <Search1
            size={18}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-text-tertiary"
          />
          <Input
            type="search"
            value={String(table.getState().globalFilter ?? "")}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            placeholder="Tìm theo tên hoặc email…"
            className="h-10 w-full pl-10 text-sm"
          />
        </label>
        {leadPicker}
      </div>
      <TabList
        aria-label="Lọc theo vai trò"
        className="flex flex-wrap items-center gap-1.5"
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            id={tab.id}
            className="group flex shrink-0 cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-text-secondary outline-none hover:bg-background-gray-secondary_alt data-[selected]:bg-badge-primary-background data-[selected]:font-semibold data-[selected]:text-badge-primary-text data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-primary-500"
          >
            {tab.label}
            <span className="rounded-md bg-background-gray-secondary px-1.5 py-0.5 text-xs tabular-nums group-data-[selected]:bg-badge-primary-background group-data-[selected]:text-badge-primary-text">
              {tab.count}
            </span>
          </Tab>
        ))}
      </TabList>
      <TabPanel
        id={role}
        className="overflow-hidden rounded-2xl border border-card-border bg-card-background outline-none focus-visible:outline-2 focus-visible:outline-primary-500"
      >
        {children}
      </TabPanel>
    </Tabs>
  );
}
