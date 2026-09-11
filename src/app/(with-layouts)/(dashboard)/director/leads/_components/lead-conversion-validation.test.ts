import { describe, expect, it } from "vitest";

import { getLeadConversionMissingFields } from "./lead-conversion-validation";

const baseLead = {
  phone: "0900000000",
  province: "Hồ Chí Minh",
  school: "THPT Thủ Đức",
  interestedMajor: "Business Administration",
};

describe("getLeadConversionMissingFields", () => {
  it("returns no blockers for a complete Lead", () => {
    expect(getLeadConversionMissingFields(baseLead)).toEqual([]);
  });

  it("returns only the missing conversion fields in form order", () => {
    expect(
      getLeadConversionMissingFields({
        ...baseLead,
        school: "",
        interestedMajor: "  ",
      }),
    ).toEqual(["high_school", "major"]);
  });

  it("treats whitespace-only values as missing", () => {
    expect(
      getLeadConversionMissingFields({
        ...baseLead,
        phone: " ",
        province: "",
      }),
    ).toEqual(["phone", "province"]);
  });
});
