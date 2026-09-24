import { describe, expect, it } from "vitest";

import { getLeadDetailHref } from "./lead-list";

describe("getLeadDetailHref", () => {
  it("opens the detail route for the selected lead", () => {
    expect(getLeadDetailHref("LEAD-0001")).toBe("/director/leads/LEAD-0001");
  });

  it("keeps the source list when opening a lead detail", () => {
    const href = getLeadDetailHref("LEAD-0001", "/sale/leads");
    expect(new URL(href, "https://ai-nes.internal").searchParams.get("returnTo")).toBe(
      "/sale/leads",
    );
  });
});
