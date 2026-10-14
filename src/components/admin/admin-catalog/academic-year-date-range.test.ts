import { describe, expect, it } from "vitest";

import { getAdmissionYearDateRangeError } from "./academic-year-date-range";

describe("admission-year effective dates", () => {
  it("explains when the end date is before the start date", () => {
    expect(getAdmissionYearDateRangeError("2027-12-31", "2027-01-01")).toBe(
      "Ngày kết thúc không được trước ngày bắt đầu.",
    );
  });

  it("allows a single-day range and incomplete ranges", () => {
    expect(
      getAdmissionYearDateRangeError("2027-12-31", "2027-12-31"),
    ).toBeNull();
    expect(getAdmissionYearDateRangeError("2027-12-31", "")).toBeNull();
  });
});
