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
  SelectItem,
  SelectIndicator,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";

import type {
  LeadSaleCampaign,
  LeadStatus,
  LeadStatusOption,
} from "@/services/api/lead-sale";

import CampaignFilter from "./campaign-filter";

interface LeadListToolbarProps {
  query: string;
  status: LeadStatus | "all";
  campaign: string;
  statusOptions: LeadStatusOption[];
  campaigns: LeadSaleCampaign[];
  campaignLoading: boolean;
  campaignError?: string;
  resultCount: number;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: LeadStatus | "all") => void;
  onCampaignChange: (value: string) => void;
  onReset: () => void;
}

export default function LeadListToolbar({
  query,
  status,
  campaign,
  statusOptions,
  campaigns,
  campaignLoading,
  campaignError,
  resultCount,
  onQueryChange,
  onStatusChange,
  onCampaignChange,
  onReset,
}: LeadListToolbarProps) {
  const hasFilter =
    query.trim().length > 0 || status !== "all" || campaign !== "";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-2.5 md:flex-row md:flex-wrap">
          <InputGroup className="h-8 min-w-0 md:max-w-md">
            <InputGroupAddon>
              <Search1 size={17} aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              className="py-1"
              aria-label="Tìm lead"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Tìm theo tên, số điện thoại, trường, người phụ trách…"
            />
          </InputGroup>
          <Select
            className="min-w-0 sm:w-52"
            value={status}
            onChange={(value) => onStatusChange(value as LeadStatus | "all")}
            aria-label="Lọc theo tình trạng lead"
          >
            <SelectTrigger size="sm" className="w-full">
              <Filter size={15} className="shrink-0 text-icon-tertiary" />
              <SelectValue />
              <SelectIndicator />
            </SelectTrigger>
            <SelectContent>
              <SelectItem id="all" textValue="Tất cả tình trạng">
                Tất cả tình trạng
              </SelectItem>
              {statusOptions.map((item) => (
                <SelectItem
                  key={item.value}
                  id={item.value}
                  textValue={item.label}
                >
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between gap-3 xl:justify-end">
          <p className="text-xs text-text-tertiary">
            <span className="font-semibold text-text-primary">
              {resultCount}
            </span>{" "}
            lead hiển thị
          </p>
          {hasFilter && (
            <Button
              size="sm"
              variant="ghost"
              appearance="ghost"
              onPress={onReset}
            >
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </div>

      <CampaignFilter
        value={campaign}
        campaigns={campaigns}
        isLoading={campaignLoading}
        onChange={onCampaignChange}
      />
      {campaignError ? (
        <p className="text-xs text-error-600" role="status">
          Không thể tải danh sách campaign để lọc.
        </p>
      ) : null}
    </div>
  );
}
