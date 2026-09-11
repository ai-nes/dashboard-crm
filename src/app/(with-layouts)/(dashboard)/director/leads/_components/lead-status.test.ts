import { describe, expect, it } from "vitest";

import {
  isLeadAssignableStatus,
  leadStageStatusOptions,
  normalizeLeadStageStatus,
} from "./lead-status";

describe("lead stage statuses", () => {
  it("exposes the processing status used by the assignment workflow", () => {
    expect(leadStageStatusOptions).toEqual([
      "NEW",
      "PROCESSING",
      "PROCESSED",
      "ASSIGNED",
      "CLOSED",
    ]);
    expect(normalizeLeadStageStatus("PROCESSING")).toBe("PROCESSING");
  });

  it("allows assignment for every non-new, non-closed status", () => {
    expect(isLeadAssignableStatus("NEW")).toBe(false);
    expect(isLeadAssignableStatus("PROCESSING")).toBe(true);
    expect(isLeadAssignableStatus("PROCESSED")).toBe(true);
    expect(isLeadAssignableStatus("ASSIGNED")).toBe(true);
    expect(isLeadAssignableStatus("CLOSED")).toBe(false);
  });
});
