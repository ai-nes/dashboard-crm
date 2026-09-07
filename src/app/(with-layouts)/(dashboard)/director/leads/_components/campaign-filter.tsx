"use client";

import { Calendar, Search1 } from "@tailgrids/icons";
import { useMemo, useState } from "react";

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
} from "@/components/tailgrids/core/select";
import type { LeadSaleCampaign } from "@/services/api/lead-sale";

const RECENT_CAMPAIGN_LIMIT = 5;

interface CampaignFilterProps {
  value: string;
  campaigns: LeadSaleCampaign[];
  isLoading: boolean;
  onChange: (value: string) => void;
}

const campaignStatusLabels: Record<string, string> = {
  ACTIVE: "Đang diễn ra",
  CLOSED: "Đã kết thúc",
  DRAFT: "Bản nháp",
  UPCOMING: "Sắp diễn ra",
};

function campaignStatusLabel(status: string) {
  const fallback = status.trim();
  return (
    campaignStatusLabels[status.trim().toUpperCase()] ??
    (fallback || "Chưa cập nhật")
  );
}

function campaignMatchesSearch(campaign: LeadSaleCampaign, search: string) {
  const normalizedSearch = search.trim().toLocaleLowerCase();
  if (!normalizedSearch) return true;

  return [campaign.name, campaign.title, campaign.stableCode]
    .filter(Boolean)
    .some((value) => value.toLocaleLowerCase().includes(normalizedSearch));
}

function CampaignStatus({ status }: { status: string }) {
  const normalizedStatus = status.trim().toUpperCase();
  const isCurrent =
    normalizedStatus === "ACTIVE" || normalizedStatus === "UPCOMING";

  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-text-tertiary">
      <span
        aria-hidden="true"
        className={`size-2 rounded-full ${isCurrent ? "bg-brand-500" : "bg-icon-tertiary"}`}
      />
      {campaignStatusLabel(status)}
    </span>
  );
}

function CampaignOption({ campaign }: { campaign: LeadSaleCampaign }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <span className="min-w-0 truncate font-medium text-text-primary">
        {campaign.title}
      </span>
      <CampaignStatus status={campaign.status} />
    </span>
  );
}

export default function CampaignFilter({
  value,
  campaigns,
  isLoading,
  onChange,
}: CampaignFilterProps) {
  const [search, setSearch] = useState("");
  const recentCampaigns = campaigns.slice(0, RECENT_CAMPAIGN_LIMIT);
  const filteredCampaigns = useMemo(
    () =>
      campaigns.filter((campaign) => campaignMatchesSearch(campaign, search)),
    [campaigns, search],
  );
  const isRecentCampaignSelected = recentCampaigns.some(
    (campaign) => campaign.name === value,
  );
  const selectedCampaign = campaigns.find(
    (campaign) => campaign.name === value,
  );

  const handleChange = (nextValue: string) => {
    setSearch("");
    onChange(nextValue);
  };

  return (
    <section aria-labelledby="campaign-filter-label" className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
        <Calendar size={17} aria-hidden="true" className="text-brand-500" />
        <h2 id="campaign-filter-label">Campaign</h2>
      </div>

      <div className="border-b border-card-border pb-3">
        <div className="flex min-w-0 items-start gap-1.5">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            <Button
              size="sm"
              variant="ghost"
              appearance="ghost"
              aria-pressed={value === ""}
              onPress={() => handleChange("")}
              className={`shrink-0 px-2.5 font-semibold ${
                value === ""
                  ? "bg-background-gray-secondary_alt text-text-primary"
                  : "text-text-secondary hover:bg-background-gray-secondary_alt"
              }`}
            >
              Tất cả
            </Button>

            {recentCampaigns.map((campaign) => {
              const isSelected = campaign.name === value;

              return (
                <Button
                  key={campaign.name}
                  size="sm"
                  variant="ghost"
                  appearance="ghost"
                  aria-pressed={isSelected}
                  aria-label={`Lọc theo campaign ${campaign.title}`}
                  onPress={() => handleChange(campaign.name)}
                  className={`max-w-[18rem] shrink-0 gap-2 px-2.5 ${
                    isSelected
                      ? "bg-background-gray-secondary_alt font-semibold text-text-primary"
                      : "text-text-secondary hover:bg-background-gray-secondary_alt"
                  }`}
                >
                  <span className="truncate">{campaign.title}</span>
                  <CampaignStatus status={campaign.status} />
                </Button>
              );
            })}
          </div>

          <Select
            className="w-auto shrink-0"
            value={value}
            onChange={(nextValue) => handleChange(String(nextValue))}
            isDisabled={isLoading}
            aria-label="Chọn campaign khác"
          >
            <SelectTrigger
              size="sm"
              className="min-w-[5.5rem] gap-1.5 whitespace-nowrap border-0 bg-transparent px-2.5 font-semibold text-brand-600 shadow-none hover:bg-background-gray-secondary_alt hover:text-brand-600"
            >
              {value && !isRecentCampaignSelected && selectedCampaign ? (
                <span className="max-w-[14rem] truncate">
                  {selectedCampaign.title}
                </span>
              ) : (
                <span>Tùy chọn</span>
              )}
              <SelectIndicator />
            </SelectTrigger>
            <SelectContent
              className="w-[min(20rem,calc(100vw-2rem))] max-h-[min(24rem,calc(100vh-8rem))]"
              header={
                <div className="border-b border-card-border p-2">
                  <InputGroup className="h-8 rounded-md focus-within:ring-2">
                    <InputGroupAddon className="px-2.5 text-text-tertiary">
                      <Search1 size={14} aria-hidden="true" />
                    </InputGroupAddon>
                    <InputGroupInput
                      className="py-1.5 text-xs"
                      aria-label="Tìm campaign"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
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
              {isLoading ? (
                <SelectItem id="campaign-loading" isDisabled>
                  Đang tải campaign...
                </SelectItem>
              ) : null}
              {filteredCampaigns.map((campaign) => (
                <SelectItem
                  key={campaign.name}
                  id={campaign.name}
                  textValue={campaign.title}
                >
                  <CampaignOption campaign={campaign} />
                </SelectItem>
              ))}
              {!isLoading && filteredCampaigns.length === 0 ? (
                <SelectItem id="campaign-empty" isDisabled>
                  Không tìm thấy campaign
                </SelectItem>
              ) : null}
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  );
}
