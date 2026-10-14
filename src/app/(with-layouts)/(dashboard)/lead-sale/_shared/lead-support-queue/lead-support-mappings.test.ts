import { describe, expect, it } from "vitest";
import type { LeadSupportItem } from "@/services/api/lead-sale";
import { supportReasonDetail, translateIssues } from "./lead-support-mappings";

const base = {
  id: "lead-1",
  leadCode: "LD-1",
  studentName: "A",
  phone: "",
  province: null,
  campus: { id: "c1", name: "Golden HCM" },
  campaign: { id: "k1", name: "K", campusId: "c2", campusName: "Golden HN" },
  processingStatus: "CLOSED",
  resolution: "INVALID",
  resolutionReason:
    "Closed because processing data is invalid: Missing or invalid phone number; Missing province.",
  reason: "INVALID",
  revision: 1,
  createdAt: "2026-10-01T00:00:00.000Z",
} satisfies LeadSupportItem;

describe("lead support mappings", () => {
  it("explains which fields made the lead invalid", () => {
    expect(supportReasonDetail(base)).toContain("số điện thoại thiếu hoặc sai");
    expect(supportReasonDetail(base)).toContain("thiếu tỉnh/thành");
  });

  it("names both campuses on a mismatch", () => {
    const detail = supportReasonDetail({ ...base, reason: "CAMPUS_MISMATCH" });
    expect(detail).toContain("Golden HCM");
    expect(detail).toContain("Golden HN");
  });

  it("translates backend issues", () => {
    expect(translateIssues(["Missing student name"])).toBe("thiếu họ tên");
  });
});
