import { describe, expect, it } from "vitest";

import { campaignStudentQuery } from "./campaign-student-query";

describe("campaign student filters", () => {
  it("sends a selected student stage using the backend stage filter", () => {
    expect(
      campaignStudentQuery({ campaign: "campaign-1", page: 1 }, "Attempting"),
    ).toEqual({
      campaign: "campaign-1",
      page: 1,
      stage: "Attempting",
    });
  });

  it("omits the stage filter for all students", () => {
    expect(
      campaignStudentQuery(
        { campaign: "campaign-1", page: 1, stage: "Attempting" },
        "all",
      ),
    ).toEqual({
      campaign: "campaign-1",
      page: 1,
    });
  });
});
