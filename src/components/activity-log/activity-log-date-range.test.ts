import { describe, expect, it } from "vitest";

import {
  getActivityDateRangeError,
  resolveActivityDateDraft,
} from "./activity-log-utils";

describe("activity log date range validation", () => {
  it("rejects an end date before the start date", () => {
    expect(getActivityDateRangeError("2026-10-12", "2026-10-01")).toBe(
      "Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.",
    );
  });

  it("accepts an ordered or incomplete date range", () => {
    expect(getActivityDateRangeError("2026-10-01", "2026-10-12")).toBeNull();
    expect(getActivityDateRangeError("2026-10-01", "")).toBeNull();
  });

  it("keeps an invalid in-progress draft until the controlled range changes", () => {
    const draft = {
      sourceStartDate: "2026-10-01",
      sourceEndDate: "2026-10-12",
      startDate: "2026-10-15",
      endDate: "2026-10-12",
    };

    expect(
      resolveActivityDateDraft(draft, {
        startDate: "2026-10-01",
        endDate: "2026-10-12",
      }),
    ).toEqual({ startDate: "2026-10-15", endDate: "2026-10-12" });
    expect(
      resolveActivityDateDraft(draft, {
        startDate: undefined,
        endDate: undefined,
      }),
    ).toEqual({ startDate: "", endDate: "" });
  });
});
