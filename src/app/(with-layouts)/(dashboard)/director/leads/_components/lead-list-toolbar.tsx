"use client";

import { Filter, Search1 } from "@tailgrids/icons";

import { Button } from "@/components/tailgrids/core/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/tailgrids/core/input-group";
import { Select, SelectContent, SelectItem, SelectIndicator, SelectTrigger, SelectValue } from "@/components/tailgrids/core/select";

import type { LeadStatus } from "./types";

interface LeadListToolbarProps {
  query: string;
  status: LeadStatus | "all";
  resultCount: number;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: LeadStatus | "all") => void;
  onReset: () => void;
}

const statuses: (LeadStatus | "all")[] = ["all", "Mới", "Đang liên hệ", "Cần bổ sung thông tin", "Không tiềm năng", "Đã chuyển đổi"];

export default function LeadListToolbar({ query, status, resultCount, onQueryChange, onStatusChange, onReset }: LeadListToolbarProps) {
  const hasFilter = query.trim().length > 0 || status !== "all";

  return (
    <div className="border-b border-card-border p-4 lg:p-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-2.5 md:flex-row">
          <InputGroup className="min-w-0 md:max-w-md">
            <InputGroupAddon>
              <Search1 size={17} aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput aria-label="Tìm lead" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Tìm theo tên, số điện thoại, trường, người phụ trách…" />
          </InputGroup>
          <Select className="min-w-0 sm:w-52" value={status} onChange={(value) => onStatusChange(value as LeadStatus | "all")} aria-label="Lọc theo tình trạng lead">
            <SelectTrigger size="sm" className="w-full">
              <Filter size={15} className="shrink-0 text-icon-tertiary" />
              <SelectValue />
              <SelectIndicator />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((item) => <SelectItem key={item} id={item} textValue={item === "all" ? "Tất cả tình trạng" : item}>{item === "all" ? "Tất cả tình trạng" : item}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between gap-3 xl:justify-end">
          <p className="text-xs text-text-tertiary"><span className="font-semibold text-text-primary">{resultCount}</span> lead hiển thị</p>
          {hasFilter && <Button size="sm" variant="ghost" appearance="ghost" onPress={onReset}>Xóa bộ lọc</Button>}
        </div>
      </div>
    </div>
  );
}
