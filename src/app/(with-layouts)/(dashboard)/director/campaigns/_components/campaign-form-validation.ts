import {
  isChannelTypeValidForMode,
  type ChannelTypeOption,
  validateChannelUrl,
} from "./channel-types";
import { isCampaignMode, isCampaignStatus } from "./mappings";
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
  if (!form.campus.trim())
    errors.campus = "Vui lòng chọn Campus cho chiến dịch.";
  const admissionYear = form.admissionYear.trim();
  const name = form.name.trim();
  const startDate = form.startDate.trim();
  const endDate = form.endDate.trim();

  if (admissionYear && !/^\d{4}$/.test(admissionYear)) {
    errors.admissionYear = "Năm tuyển sinh phải gồm 4 chữ số.";
  } else if (admissionYear && (
    Number(admissionYear) < MIN_ADMISSION_YEAR ||
    Number(admissionYear) > MAX_ADMISSION_YEAR
  )) {
    errors.admissionYear = `Năm tuyển sinh phải từ ${MIN_ADMISSION_YEAR} đến ${MAX_ADMISSION_YEAR}.`;
  }

  if (!name) {
    errors.name = "Vui lòng nhập tên chiến dịch.";
  } else if (name.length > MAX_CAMPAIGN_NAME_LENGTH) {
    errors.name = `Tên chiến dịch không được vượt quá ${MAX_CAMPAIGN_NAME_LENGTH} ký tự.`;
  }

  if (startDate && !isValidIsoDate(startDate)) {
    errors.startDate = "Ngày bắt đầu không hợp lệ.";
  }

  if (endDate && !isValidIsoDate(endDate)) {
    errors.endDate = "Ngày kết thúc không hợp lệ.";
  }

  if (
    startDate &&
    endDate &&
    isValidIsoDate(startDate) &&
    isValidIsoDate(endDate) &&
    startDate > endDate
  ) {
    errors.startDate = "Ngày bắt đầu phải trước ngày kết thúc.";
    errors.endDate = "Ngày kết thúc phải sau ngày bắt đầu.";
  }

  if (!isCampaignStatus(form.status)) {
    errors.status = "Vui lòng chọn trạng thái hợp lệ.";
  }

  if (!isCampaignMode(form.mode)) {
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

  if (form.leadRoutingEnabled) {
    if (!form.leadRoutingTargetType) {
      errors.leadRoutingTargetType =
        "Vui lòng chọn phạm vi nhận Lead của Campaign.";
    } else if (
      form.leadRoutingTargetType === "Team" &&
      !form.leadRoutingTargetTeam
    ) {
      errors.leadRoutingTargetTeam = "Vui lòng chọn Team nhận Lead.";
    } else if (
      form.leadRoutingTargetType === "Team Group" &&
      !form.leadRoutingTargetGroup
    ) {
      errors.leadRoutingTargetGroup = "Vui lòng chọn Team Group nhận Lead.";
    }
  }

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
