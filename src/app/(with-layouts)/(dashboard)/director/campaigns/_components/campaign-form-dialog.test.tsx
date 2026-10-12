import { describe, expect, it } from "vitest";

import type { CampaignListItem } from "./types";
import {
  filterCampaignGroupOptions,
  formFromCampaign,
  toCampaignFormValues,
} from "./campaign-form-dialog";

const historicalCampaign: CampaignListItem = {
  id: "campaign-old",
  code: "OLD",
  name: "Campaign cũ",
  admissionYear: null,
  startDate: "2026-11-01",
  endDate: "",
  status: "ACTIVE",
  mode: "OFFLINE",
  channelType: "",
  channelUrl: "",
  campus: "Campus A",
  leadRoutingEnabled: false,
  leadRoutingTargetType: "",
  leadRoutingTargetTeam: "",
  leadRoutingTargetGroup: "",
};

describe("campaign form metadata", () => {
  it("keeps an existing null admission year blank and submits it as null", () => {
    const form = formFromCampaign(historicalCampaign);

    expect(form.admissionYear).toBe("");
    expect(toCampaignFormValues(form).admissionYear).toBeNull();
  });

  it("defaults only a new campaign to the current editable year", () => {
    expect(formFromCampaign(null).admissionYear).toBe(
      String(new Date().getFullYear()),
    );
    expect(formFromCampaign(null)).toMatchObject({
      status: "DRAFT",
      mode: "OFFLINE",
    });
  });

  it("keeps unknown existing mode and status blank for explicit correction", () => {
    const form = formFromCampaign({
      ...historicalCampaign,
      status: "",
      mode: "",
    });

    expect(form).toMatchObject({ status: "", mode: "" });
    expect(toCampaignFormValues(form)).toMatchObject({ status: "", mode: "" });
  });

  it("keeps explicitly cleared optional dates and URL in the form payload", () => {
    const values = toCampaignFormValues({
      ...formFromCampaign(historicalCampaign),
      startDate: "",
      endDate: "",
      channelUrl: "   ",
    });

    expect(values).toMatchObject({
      admissionYear: null,
      startDate: "",
      endDate: "",
      channelUrl: "",
    });
  });

  it("filters multi-campus Team Groups by selected campus without duplicating them", () => {
    const groups = [
      {
        id: "group-1",
        label: "North Group",
        campusIds: ["CAMPUS-A", "CAMPUS-B"],
      },
      { id: "group-2", label: "South Group", campusIds: ["CAMPUS-B"] },
    ];

    expect(filterCampaignGroupOptions(groups, "CAMPUS-A")).toEqual([
      groups[0],
    ]);
  });
});
