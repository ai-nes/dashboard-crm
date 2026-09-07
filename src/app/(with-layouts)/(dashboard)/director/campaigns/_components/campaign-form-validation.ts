import {
  isChannelTypeValidForMode,
  type ChannelTypeOption,
  validateChannelUrl,
} from "./channel-types";
import { campaignModeOptions, campaignStatusOptions } from "./mappings";
import type { CampaignFormState } from "./types";

export type CampaignFormErrors = Partial<
  Record<keyof CampaignFormState, string>
>;

const MIN_ADMISSION_YEAR = 2000;
const MAX_ADMISSION_YEAR = 2100;
const MAX_CAMPAIGN_NAME_LENGTH = 140;

export function validateCampaignForm(
  form: CampaignFormState,
  channelTypes: readonly ChannelTypeOption[],
): CampaignFormErrors {
  const errors: CampaignFormErrors = {};
  const admissionYear = form.admissionYear.trim();
  const name = form.name.trim();
  const startDate = form.startDate.trim();
  const endDate = form.endDate.trim();

  if (!admissionYear) {
    errors.admissionYear = "Vui lòng nhập năm tuyển sinh.";
  } else if (!/^\d{4}$/.test(admissionYear)) {
    errors.admissionYear = "Năm tuyển sinh phải gồm 4 chữ số.";
  } else if (
    Number(admissionYear) < MIN_ADMISSION_YEAR ||
    Number(admissionYear) > MAX_ADMISSION_YEAR
  ) {
    errors.admissionYear = `Năm tuyển sinh phải từ ${MIN_ADMISSION_YEAR} đến ${MAX_ADMISSION_YEAR}.`;
  }

  if (!name) {
    errors.name = "Vui lòng nhập tên chiến dịch.";
  } else if (name.length > MAX_CAMPAIGN_NAME_LENGTH) {
    errors.name = `Tên chiến dịch không được vượt quá ${MAX_CAMPAIGN_NAME_LENGTH} ký tự.`;
  }

  if (!startDate) {
    errors.startDate = "Vui lòng chọn ngày bắt đầu.";
  } else if (!isValidIsoDate(startDate)) {
    errors.startDate = "Ngày bắt đầu không hợp lệ.";
  }

  if (!endDate) {
    errors.endDate = "Vui lòng chọn ngày kết thúc.";
  } else if (!isValidIsoDate(endDate)) {
    errors.endDate = "Ngày kết thúc không hợp lệ.";
  }

  if (
    isValidIsoDate(startDate) &&
    isValidIsoDate(endDate) &&
    startDate > endDate
  ) {
    errors.startDate = "Ngày bắt đầu phải trước ngày kết thúc.";
    errors.endDate = "Ngày kết thúc phải sau ngày bắt đầu.";
  }

  if (!campaignStatusOptions.includes(form.status)) {
    errors.status = "Vui lòng chọn trạng thái hợp lệ.";
  }

  if (!campaignModeOptions.includes(form.mode)) {
    errors.mode = "Vui lòng chọn hình thức hợp lệ.";
  }

  if (
    form.channelType &&
    !isChannelTypeValidForMode(form.channelType, form.mode, channelTypes)
  ) {
    errors.channelType = "Loại kênh không phù hợp với hình thức đã chọn.";
  }

  const channelUrlError = validateChannelUrl(form.channelUrl);
  if (channelUrlError) errors.channelUrl = channelUrlError;

  return errors;
}

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}
