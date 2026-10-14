import { describe, expect, it } from "vitest";

import {
  getCampaignModeColor,
  getCampaignModeLabel,
  getCampaignStatusColor,
  getCampaignStatusLabel,
} from "./mappings";

describe("campaign labels for preserved legacy values", () => {
  it("displays unknown status and mode as neutral without inventing values", () => {
    expect(getCampaignStatusLabel("")).toBe("—");
    expect(getCampaignStatusColor("")).toBe("gray");
    expect(getCampaignModeLabel("")).toBe("—");
    expect(getCampaignModeColor("")).toBe("gray");
  });

  it("retains labels and colors for known campaign values", () => {
    expect(getCampaignStatusLabel("ACTIVE")).toBe("Đang diễn ra");
    expect(getCampaignStatusColor("ACTIVE")).toBe("success");
    expect(getCampaignModeLabel("ONLINE")).toBe("Trực tuyến");
    expect(getCampaignModeColor("ONLINE")).toBe("sky");
  });
});
