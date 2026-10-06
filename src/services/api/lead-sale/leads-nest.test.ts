import { describe, expect, it } from "vitest";
import { toNestLeadBody } from "./leads-nest";

describe("toNestLeadBody", () => {
  it("maps Frappe field names and drops empty values", () => {
    expect(
      toNestLeadBody({
        student_name: " Nguyen Van A ",
        phone: "0901234567",
        province: "HCM",
        branch: "",
        email: null,
        conversion_potential: "Trung bình",
        segments: '["a","b"]',
        campaign: "Spring",
      }),
    ).toEqual({
      studentName: "Nguyen Van A",
      phone: "0901234567",
      provinceId: "HCM",
      conversionPotential: "medium",
      segments: ["a", "b"],
      campaignId: "Spring",
    });
  });

  it("accepts comma separated segments and ignores unknown fields", () => {
    expect(toNestLeadBody({ segments: "x, y", source: "Facebook" })).toEqual({
      segments: ["x", "y"],
    });
  });
});
