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

interface LeadListToolbarProps {
  query: string;
  status: LeadStatus | "all";
  campaign: string;
  campaignSearch: string;
  statusOptions: LeadStatusOption[];
  campaigns: LeadSaleCampaign[];
  campaignLoading: boolean;
  campaignError?: string;
  resultCount: number;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: LeadStatus | "all") => void;
  onCampaignSearchChange: (value: string) => void;
  onCampaignChange: (value: string) => void;
  onReset: () => void;
}

export default function LeadListToolbar({
  query,
  status,
  campaign,
  campaignSearch,
  statusOptions,
  campaigns,
  campaignLoading,
  campaignError,
  resultCount,
  onQueryChange,
  onStatusChange,
  onCampaignSearchChange,
  onCampaignChange,
  onReset,
}: LeadListToolbarProps) {
  const hasFilter =
    query.trim().length > 0 ||
    status !== "all" ||
    campaign !== "" ||
    campaignSearch.trim().length > 0;

  const campaignLabel = (item: LeadSaleCampaign) => {
    return item.stableCode ? `${item.title} (${item.stableCode})` : item.title;
  };

  return (
    <div className="border-b border-card-border p-4 lg:p-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-2.5 md:flex-row md:flex-wrap">
          <InputGroup className="min-w-0 md:max-w-md">
            <InputGroupAddon>
              <Search1 size={17} aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
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
          <Select
            className="min-w-0 sm:w-72"
            value={campaign}
            onChange={(value) => onCampaignChange(String(value))}
            isDisabled={campaignLoading}
            aria-label="Lọc theo campaign"
          >
            <SelectTrigger size="sm" className="w-full">
              <Filter size={15} className="shrink-0 text-icon-tertiary" />
              <SelectValue />
              <SelectIndicator />
            </SelectTrigger>
            <SelectContent
              header={
                <div className="border-b border-card-border p-2">
                  <InputGroup>
                    <InputGroupAddon>
                      <Search1 size={16} aria-hidden="true" />
                    </InputGroupAddon>
                    <InputGroupInput
                      aria-label="Tìm campaign"
                      value={campaignSearch}
                      onChange={(event) => onCampaignSearchChange(event.target.value)}
                      onKeyDown={(event) => event.stopPropagation()}
                      placeholder="Tìm campaign..."
                    />
                  </InputGroup>
                </div>
              }
            >
              <SelectItem id="" textValue="Tất cả campaign">
                Tất cả campaign
              </SelectItem>
              {campaignLoading ? (
                <SelectItem id="campaign-loading" isDisabled>
                  Đang tải campaign...
                </SelectItem>
              ) : null}
              {campaigns.map((item) => {
                const label = campaignLabel(item);
                return (
                  <SelectItem key={item.name} id={item.name} textValue={label}>
                    {label}
                  </SelectItem>
                );
              })}
              {!campaignLoading && campaigns.length === 0 ? (
                <SelectItem id="campaign-empty" isDisabled>
                  Không tìm thấy campaign
                </SelectItem>
              ) : null}
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
      {campaignError ? (
        <p className="mt-2 text-xs text-error-600" role="status">
          Không thể tải danh sách campaign để lọc.
        </p>
      ) : null}
    </div>
  );
}
