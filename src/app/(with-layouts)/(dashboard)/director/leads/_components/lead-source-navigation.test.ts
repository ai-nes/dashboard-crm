import { describe, expect, it } from "vitest";

import {
  leadBackHref,
  leadDetailHref,
  leadEditHref,
} from "./lead-source-navigation";

describe("Lead campaign source navigation", () => {
  it("returns to the campaign detail route carried by the Lead link", () => {
    const source = "/lead-sale/campaigns/CMP-FPTU-HCM-261012-ABCD";
    const href = leadDetailHref("LD-2026-HCM-000001", source);
    const url = new URL(href, "http://crm.local");

    expect(url.pathname).toBe("/director/leads/LD-2026-HCM-000001");
    expect(leadEditHref(href)).toContain(
      "returnTo=%2Flead-sale%2Fcampaigns%2FCMP-FPTU-HCM-261012-ABCD",
    );
    expect(
      new URL(leadEditHref(href), "http://crm.local").searchParams.get("edit"),
    ).toBe("contact");
    expect(
      leadBackHref(
        url.searchParams.get("returnTo") ?? undefined,
        "/lead-sale/leads",
      ),
    ).toBe(source);
  });

  it.each(["https://evil.example/", "//evil.example/", "/director/students"])(
    "rejects an unsafe or unrelated return path: %s",
    (path) => {
      expect(leadBackHref(path, "/lead-sale/leads")).toBe("/lead-sale/leads");
    },
  );
});
