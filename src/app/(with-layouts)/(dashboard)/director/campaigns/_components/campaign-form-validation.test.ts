import { describe, expect, it } from "vitest";

import { validateCampaignForm } from "./campaign-form-validation";
import type { CampaignFormState } from "./types";

const channelTypes = [
  {
    code: "EXPERIENCE_DAY",
    displayName: "Experience Day",
    modes: ["OFFLINE" as const],
    enabled: true,
    sortOrder: 1,
    description: "",
  },
  {
    code: "FACEBOOK_LEAD_FORM",
    displayName: "Facebook Lead Form",
    modes: ["ONLINE" as const],
    enabled: true,
    sortOrder: 2,
    description: "",
  },
];

const validForm: CampaignFormState = {
  name: "Tuyển sinh mùa thu 2026",
  admissionYear: "2026",
  startDate: "2026-09-01",
  endDate: "2026-09-30",
  status: "UPCOMING",
  mode: "ONLINE",
  channelType: "FACEBOOK_LEAD_FORM",
  channelUrl: "https://example.com/lead-form",
};

describe("campaign form validation", () => {
  it("accepts a valid campaign form", () => {
    expect(validateCampaignForm(validForm, channelTypes)).toEqual({});
  });

  it("returns an error for every invalid required field", () => {
    const errors = validateCampaignForm(
      {
        ...validForm,
        name: "",
        admissionYear: "26",
        startDate: "",
        endDate: "2026-02-30",
        status: "UNKNOWN" as CampaignFormState["status"],
        mode: "UNKNOWN" as CampaignFormState["mode"],
        channelType: "EXPERIENCE_DAY",
        channelUrl: "not-a-url",
      },
      channelTypes,
    );

    expect(errors).toEqual({
      admissionYear: "Năm tuyển sinh phải gồm 4 chữ số.",
      name: "Vui lòng nhập tên chiến dịch.",
      startDate: "Vui lòng chọn ngày bắt đầu.",
      endDate: "Ngày kết thúc không hợp lệ.",
      status: "Vui lòng chọn trạng thái hợp lệ.",
      mode: "Vui lòng chọn hình thức hợp lệ.",
      channelType: "Loại kênh không phù hợp với hình thức đã chọn.",
      channelUrl: "Channel URL không hợp lệ. Ví dụ: https://example.com/.",
    });
  });

  it("validates date order and trims optional values", () => {
    const errors = validateCampaignForm(
      {
        ...validForm,
        startDate: "2026-10-01",
        endDate: "2026-09-30",
        channelType: "",
        channelUrl: "   ",
      },
      channelTypes,
    );

    expect(errors).toEqual({
      startDate: "Ngày bắt đầu phải trước ngày kết thúc.",
      endDate: "Ngày kết thúc phải sau ngày bắt đầu.",
    });
  });
});
