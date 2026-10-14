import type {
  CampaignChannelType,
  CampaignChannelTypeMode,
} from "@/services/api/lead-sale";

import type { CampaignModeValue } from "./types";

export type ChannelTypeValue = CampaignChannelType["code"];
export type ChannelTypeOption = CampaignChannelType;

export function validateChannelUrl(value: string): string | null {
  const normalized = value.trim();
  if (!normalized) return null;

  try {
    const url = new URL(normalized);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "Channel URL phải bắt đầu bằng http:// hoặc https://.";
    }
  } catch {
    return "Channel URL không hợp lệ. Ví dụ: https://example.com/.";
  }

  return null;
}

export function channelTypeOptionsForMode(
  options: readonly ChannelTypeOption[],
  mode: CampaignModeValue,
): ChannelTypeOption[] {
  if (!mode) return [];
  return options.filter((option) => option.modes.includes(mode as CampaignChannelTypeMode));
}

export function getChannelTypeLabel(
  options: readonly ChannelTypeOption[],
  value: ChannelTypeValue | "",
): string {
  return options.find((option) => option.code.toLowerCase() === value.toLowerCase())?.displayName ?? value;
}

export function isChannelTypeValidForMode(
  value: ChannelTypeValue | "",
  mode: CampaignModeValue,
  options: readonly ChannelTypeOption[],
): boolean {
  if (!value) return true;
  if (!mode) return false;
  const option = options.find((item) => item.code.toLowerCase() === value.toLowerCase());
  return option ? option.modes.includes(mode) : false;
}
