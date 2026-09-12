import { describe, expect, it } from "vitest";

import { isHighSchoolAdmissionMethodValue } from "./student-admission-method";

describe("isHighSchoolAdmissionMethodValue", () => {
  it("recognizes the canonical THPT score method code", () => {
    expect(isHighSchoolAdmissionMethodValue("THPT_SCORE")).toBe(true);
  });

  it("recognizes a THPT label returned by the catalog", () => {
    expect(
      isHighSchoolAdmissionMethodValue("HIGH_SCHOOL", "Xét tuyển THPT"),
    ).toBe(true);
  });

  it("does not show the score card when no admission method is selected", () => {
    expect(isHighSchoolAdmissionMethodValue("", "")).toBe(false);
    expect(isHighSchoolAdmissionMethodValue("TRANSCRIPT_REVIEW", "Xét học bạ")).toBe(
      false,
    );
  });
});
