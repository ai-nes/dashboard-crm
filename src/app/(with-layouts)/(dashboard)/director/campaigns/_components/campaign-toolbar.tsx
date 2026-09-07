"use client";

import { Search1 } from "@tailgrids/icons";
import { Label } from "react-aria-components";

import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { TextField } from "@/components/tailgrids/core/text-field";
import { cn } from "@/utils/cn";

import { campaignStatusLabel } from "./mappings";
import type { CampaignStatus, CampaignStatusFilter } from "./types";

interface CampaignToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  status: CampaignStatusFilter;
  onStatusChange: (value: CampaignStatusFilter) => void;
  counts: Record<CampaignStatusFilter, number>;
}

const statuses: CampaignStatus[] = ["DRAFT", "UPCOMING", "ACTIVE", "CLOSED"];

export default function CampaignToolbar({
  query,
  onQueryChange,
  status,
  onStatusChange,
  counts,
}: CampaignToolbarProps) {
  return (
    <div className="space-y-3">
      <TextField value={query} onChange={onQueryChange} className="w-full sm:max-w-sm">
        <Label className="sr-only">Tìm chiến dịch</Label>
        <div className="relative">
          <Search1 size={16} aria-hidden="true" className="pointer-events-none absolute top-3 left-3 text-text-tertiary" />
          <Input placeholder="Tìm theo mã hoặc tên chiến dịch…" className="h-10 w-full pl-9 text-sm" />
        </div>
      </TextField>

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Lọc theo trạng thái chiến dịch">
        <Button
          appearance="ghost"
          size="sm"
          aria-pressed={status === "all"}
          className={cn("text-text-secondary", status === "all" && "bg-badge-primary-background text-badge-primary-text")}
          onPress={() => onStatusChange("all")}
        >
          Tất cả <span className="tabular-nums opacity-70">{counts.all}</span>
        </Button>
        {statuses.map((item) => (
          <Button
            key={item}
            appearance="ghost"
            size="sm"
            aria-pressed={status === item}
            className={cn("text-text-secondary", status === item && "bg-badge-primary-background text-badge-primary-text")}
            onPress={() => onStatusChange(item)}
          >
            {campaignStatusLabel[item]} <span className="tabular-nums opacity-70">{counts[item]}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
