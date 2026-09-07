import { describe, expect, it } from "vitest";

import { getLeadDetailHref } from "./lead-list";

describe("getLeadDetailHref", () => {
  it("opens the detail route for the selected lead", () => {
    expect(getLeadDetailHref("LEAD-0001")).toBe("/director/leads/LEAD-0001");
  });
});
