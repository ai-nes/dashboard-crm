import type { CampaignMode } from "./types";

export type ChannelTypeValue =
  | "facebook_lead_form"
  | "tiktok_lead_form"
  | "google_lead_form"
  | "zalo_lead_form"
  | "facebook_landing_page"
  | "google_search_ads_landing_page"
  | "tiktok_landing_page"
  | "zalo_landing_page"
  | "hotline"
  | "website_daihoc_marcom"
  | "crm_it_ho"
  | "class_counseling"
  | "open_day"
  | "experience_day"
  | "high_school_general_counseling"
  | "counseling_booth"
  | "high_school_seminar"
  | "admission_counseling_program"
  | "career_counseling_program"
  | "parent_seminar"
  | "parent_counseling_day"
  | "campus_direct_counseling"
  | "referral"
  | "other";

export interface ChannelTypeOption {
  value: ChannelTypeValue;
  label: string;
  modes: CampaignMode[];
}

export const CHANNEL_TYPE_OPTIONS: ChannelTypeOption[] = [
  // Kênh trực tuyến (digital / từ xa)
  { value: "facebook_lead_form", label: "Facebook Lead Form", modes: ["ONLINE"] },
  { value: "tiktok_lead_form", label: "TikTok Lead Form", modes: ["ONLINE"] },
  { value: "google_lead_form", label: "Google Lead Form", modes: ["ONLINE"] },
  { value: "zalo_lead_form", label: "Zalo Lead Form", modes: ["ONLINE"] },
  { value: "facebook_landing_page", label: "Facebook Lead Landing Page", modes: ["ONLINE"] },
  { value: "google_search_ads_landing_page", label: "Google Search Ads Landing Page", modes: ["ONLINE"] },
  { value: "tiktok_landing_page", label: "TikTok Lead Landing Page", modes: ["ONLINE"] },
  { value: "zalo_landing_page", label: "Zalo Lead Landing Page", modes: ["ONLINE"] },
  { value: "hotline", label: "Tổng đài", modes: ["ONLINE"] },
  { value: "website_daihoc_marcom", label: "Website Đại học - Marcom", modes: ["ONLINE"] },
  { value: "crm_it_ho", label: "CRM IT HO", modes: ["ONLINE"] },
  // Kênh trực tiếp (sự kiện / gặp mặt tại chỗ)
  { value: "class_counseling", label: "Tư vấn lớp", modes: ["OFFLINE"] },
  { value: "open_day", label: "Open Day", modes: ["OFFLINE"] },
  { value: "experience_day", label: "Experience Day", modes: ["OFFLINE"] },
  { value: "high_school_general_counseling", label: "Tư vấn chung ở trường THPT", modes: ["OFFLINE"] },
  { value: "counseling_booth", label: "Đặt bàn tư vấn", modes: ["OFFLINE"] },
  { value: "high_school_seminar", label: "Chuyên đề tại trường THPT", modes: ["OFFLINE"] },
  { value: "admission_counseling_program", label: "Chương trình tư vấn tuyển sinh", modes: ["OFFLINE"] },
  { value: "career_counseling_program", label: "Chương trình tư vấn hướng nghiệp", modes: ["OFFLINE"] },
  { value: "parent_seminar", label: "Hội thảo PHHS", modes: ["OFFLINE"] },
  { value: "parent_counseling_day", label: "Ngày hội tư vấn PHHS", modes: ["OFFLINE"] },
  { value: "campus_direct_counseling", label: "Tư vấn tuyển sinh trực tiếp tại campus", modes: ["OFFLINE"] },
  // Áp dụng cho cả hai hình thức
  { value: "referral", label: "Giới thiệu", modes: ["ONLINE", "OFFLINE"] },
  { value: "other", label: "Khác", modes: ["ONLINE", "OFFLINE"] },
];

export const channelTypeLabel: Record<ChannelTypeValue, string> = CHANNEL_TYPE_OPTIONS.reduce(
  (acc, option) => {
    acc[option.value] = option.label;
    return acc;
  },
  {} as Record<ChannelTypeValue, string>,
);

export function channelTypeOptionsForMode(mode: CampaignMode): ChannelTypeOption[] {
  return CHANNEL_TYPE_OPTIONS.filter((option) => option.modes.includes(mode));
}

export function isChannelTypeValidForMode(
  value: ChannelTypeValue | "",
  mode: CampaignMode,
): boolean {
  if (!value) return true;
  const option = CHANNEL_TYPE_OPTIONS.find((item) => item.value === value);
  return option ? option.modes.includes(mode) : false;
}
