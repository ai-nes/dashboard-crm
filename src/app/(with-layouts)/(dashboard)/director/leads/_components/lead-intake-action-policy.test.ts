import { describe, expect, it } from "vitest";

import { shouldShowLeadAssignmentButton } from "./lead-intake-action-policy";

describe("shouldShowLeadAssignmentButton", () => {
  it("shows the batch assignment button on Lead Sale when permitted", () => {
    expect(
      shouldShowLeadAssignmentButton({
        pathname: "/lead-sale/leads",
        canManageLeadIntake: true,
        hasMeta: true,
        hasPendingNew: false,
      }),
    ).toBe(true);
  });

  it.each([
    ["sale route", "/sale/leads"],
    ["CTV Sale route", "/ctv-sale/leads"],
  ])("hides the button on the %s", (_label, pathname) => {
    expect(
      shouldShowLeadAssignmentButton({
        pathname,
        canManageLeadIntake: true,
        hasMeta: true,
        hasPendingNew: false,
      }),
    ).toBe(false);
  });

  it("hides the button when assignment permission is unavailable", () => {
    expect(
      shouldShowLeadAssignmentButton({
        pathname: "/lead-sale/leads",
        canManageLeadIntake: false,
        hasMeta: true,
        hasPendingNew: false,
      }),
    ).toBe(false);
  });
});
