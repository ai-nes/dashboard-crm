"use client";

import { Search1 } from "@tailgrids/icons";
import { Label } from "react-aria-components";

import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { TextField } from "@/components/tailgrids/core/text-field";
import {
  leadStageStatusLabel,
  leadStageStatusOptions,
  type LeadStageStatus,
} from "@/app/(with-layouts)/(dashboard)/director/leads/_components/lead-status";
import { cn } from "@/utils/cn";

import type { CampaignLeadStatusFilter } from "./campaign-detail-leads";

interface CampaignDetailLeadToolbarProps {
  query: string;
  status: CampaignLeadStatusFilter;
  counts: Record<CampaignLeadStatusFilter, number>;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: CampaignLeadStatusFilter) => void;
}

export default function CampaignDetailLeadToolbar({
  query,
  status,
  counts,
  onQueryChange,
  onStatusChange,
}: CampaignDetailLeadToolbarProps) {
  return (
    <div className="space-y-3">
      <TextField
        value={query}
        onChange={onQueryChange}
        className="w-full sm:max-w-sm"
      >
        <Label className="sr-only">Tìm lead trong chiến dịch</Label>
        <div className="relative">
          <Search1
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute top-3 left-3 text-text-tertiary"
          />
          <Input
            placeholder="Tìm theo tên, số điện thoại, trường…"
            className="h-10 w-full pl-9 text-sm"
          />
        </div>
      </TextField>

      <div
        className="flex flex-wrap gap-1.5"
        role="group"
        aria-label="Lọc lead theo trạng thái"
      >
        <Button
          appearance="ghost"
          size="sm"
          aria-pressed={status === "all"}
          className={cn(
            "text-text-secondary",
            status === "all" &&
              "bg-badge-primary-background text-badge-primary-text",
          )}
          onPress={() => onStatusChange("all")}
        >
          Tất cả <span className="tabular-nums opacity-70">{counts.all}</span>
        </Button>
        {leadStageStatusOptions.map((item: LeadStageStatus) => (
          <Button
            key={item}
            appearance="ghost"
            size="sm"
            aria-pressed={status === item}
            className={cn(
              "text-text-secondary",
              status === item &&
                "bg-badge-primary-background text-badge-primary-text",
            )}
            onPress={() => onStatusChange(item)}
          >
            {leadStageStatusLabel[item]}{" "}
            <span className="tabular-nums opacity-70">{counts[item]}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
