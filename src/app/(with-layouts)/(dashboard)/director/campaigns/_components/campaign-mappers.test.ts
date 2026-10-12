import { describe, expect, it } from "vitest";

import type { LeadSaleCampaign } from "@/services/api/lead-sale";

import { toCampaignListItem } from "./campaign-mappers";

describe("campaign display mapping", () => {
  it("keeps the campaign id for navigation and uses readable values when business fields are missing", () => {
    const campaign: LeadSaleCampaign = {
      name: "8f2d69d0-1795-4c52-a94a-e77c9ef64918",
      stableCode: "",
      title: "",
      status: "ACTIVE",
      admissionYear: null,
      channelType: null,
    };

    expect(toCampaignListItem(campaign)).toMatchObject({
      id: "8f2d69d0-1795-4c52-a94a-e77c9ef64918",
      code: "",
      name: "Chiến dịch chưa có tên",
    });
  });

  it("retains campaign business code and title when supplied", () => {
    const campaign: LeadSaleCampaign = {
      name: "campaign-id-1",
      stableCode: "CAM-2026-001",
      title: "Tư vấn tuyển sinh 2026",
      status: "ACTIVE",
      admissionYear: 2027,
      channelType: "FACEBOOK_LEAD_FORM",
    };

    expect(toCampaignListItem(campaign)).toMatchObject({
      id: "campaign-id-1",
      code: "CAM-2026-001",
      name: "Tư vấn tuyển sinh 2026",
      admissionYear: 2027,
      channelType: "FACEBOOK_LEAD_FORM",
    });
  });

  it("preserves a null historical year instead of deriving it from the start date", () => {
    const campaign: LeadSaleCampaign = {
      name: "campaign-old",
      stableCode: "OLD",
      title: "Campaign cũ",
      status: "ACTIVE",
      startDate: "2026-11-01",
      admissionYear: null,
      channelType: null,
    };

    expect(toCampaignListItem(campaign)).toMatchObject({
      startDate: "2026-11-01",
      admissionYear: null,
      channelType: "",
    });
  });

  it("normalizes a valid status case without inventing a status or mode", () => {
    expect(
      toCampaignListItem({
        name: "campaign-case",
        stableCode: "CASE",
        title: "Campaign casing",
        status: "Active",
        channelBoundary: "Digital",
        admissionYear: null,
        channelType: null,
      }),
    ).toMatchObject({ status: "ACTIVE", mode: "ONLINE" });

    expect(
      toCampaignListItem({
        name: "campaign-unknown",
        stableCode: "UNKNOWN",
        title: "Campaign legacy",
        status: "UNRECOGNIZED",
        channelBoundary: null,
        admissionYear: null,
        channelType: null,
      }),
    ).toMatchObject({ status: "", mode: "" });
  });
});
