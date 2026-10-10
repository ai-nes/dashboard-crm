import { describe, it, expect } from "vitest";
import { normalizeLeadDetail } from "@/services/api/lead-sale/leads";
import {
  getContactForm,
  getAdmissionForm,
  getSourceForm,
} from "./lead-detail-form";

describe("Lead detail form initialization", () => {
  it("uses catalog IDs rather than display labels", () => {
    const lead = normalizeLeadDetail({
      lead: {
        id: "lead-1",
        name: "Lead",
        province: "Province",
        ward: "Ward",
        school: "School",
        interestedMajor: "Major",
        aspiration: "Aspiration",
        enrollmentYear: "2026",
        branch: "Campus",
        source: "Source",
        provinceId: "p-id",
        wardId: "w-id",
        highSchoolId: "hs-id",
        majorId: "m-id",
        aspirationId: "a-id",
        admissionYearId: "y-id",
        campusId: "c-id",
        sourceId: "s-id",
      },
      log: [],
      meta: {},
    }).lead;
    expect(getContactForm(lead)).toMatchObject({
      province: "p-id",
      ward: "w-id",
      high_school: "hs-id",
    });
    expect(getAdmissionForm(lead)).toMatchObject({
      major: "m-id",
      aspiration: "a-id",
      admission_year: "y-id",
      branch: "c-id",
    });
    expect(getSourceForm(lead).source).toBe("s-id");
  });

  it("keeps legacy labels when an older response has no IDs", () => {
    const lead = normalizeLeadDetail({
      lead: {
        id: "legacy",
        province: "Province",
        interestedMajor: "Major",
        source: "Source",
      },
      log: [],
      meta: {},
    }).lead;
    expect(getContactForm(lead).province).toBe("Province");
    expect(getAdmissionForm(lead).major).toBe("Major");
    expect(getSourceForm(lead).source).toBe("Source");
  });
});
