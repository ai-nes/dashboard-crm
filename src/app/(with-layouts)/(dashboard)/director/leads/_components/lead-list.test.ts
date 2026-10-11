import { describe, expect, it } from "vitest";

import { getLeadDetailHref } from "./lead-list";

describe("getLeadDetailHref", () => {
  it("opens the detail route for the selected lead", () => {
    expect(getLeadDetailHref("LEAD-0001")).toBe("/director/leads/LEAD-0001");
  });

  it("prefers the business code and encodes it as a path segment", () => {
    expect(getLeadDetailHref("internal-id", "LD-2026-HCM-003978")).toBe(
      "/director/leads/LD-2026-HCM-003978",
    );
    expect(getLeadDetailHref("old/id", "")).toBe("/director/leads/old%2Fid");
  });
});
