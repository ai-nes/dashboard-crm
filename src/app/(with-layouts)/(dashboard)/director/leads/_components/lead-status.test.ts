import { describe, expect, it } from "vitest";

import {
  leadStageStatusOptions,
  normalizeLeadStageStatus,
} from "./lead-status";

describe("lead stage statuses", () => {
  it("does not expose the removed processing status", () => {
    expect(leadStageStatusOptions).toEqual([
      "NEW",
      "PROCESSED",
      "ASSIGNED",
      "CLOSED",
    ]);
    expect(normalizeLeadStageStatus("PROCESSING")).toBeNull();
  });
});
