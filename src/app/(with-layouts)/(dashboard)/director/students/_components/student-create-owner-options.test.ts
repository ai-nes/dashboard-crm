import { describe, expect, it } from "vitest";

import {
  studentCreateCurrentUserId,
  studentCreateDefaultOwner,
  studentCreateOwnerOptions,
  studentCreateOwnerValue,
} from "./student-create-owner-options";

describe("student creation owner options", () => {
  const options = [
    { id: "sale-1", label: "Sale 1" },
    { id: "sale-2", label: "Sale 2" },
  ];

  it("uses the CRM user ID for owner options instead of the login email", () => {
    expect(
      studentCreateCurrentUserId({
        crm_user_id: "sale-user-id",
        user: "sale@example.test",
      }),
    ).toBe("sale-user-id");
  });

  it("restricts own-scoped sellers to their own account", () => {
    expect(studentCreateOwnerOptions(options, "sale-1", "assigned")).toEqual([
      options[0],
    ]);
  });

  it("restricts owner choices by assignment scope when read scope is wider", () => {
    expect(
      studentCreateOwnerOptions(options, "sale-1", "team", "assigned"),
    ).toEqual([options[0]]);
  });

  it("keeps team and all-scope owner choices available", () => {
    expect(studentCreateOwnerOptions(options, "lead-1", "team")).toEqual(
      options,
    );
    expect(studentCreateOwnerOptions(options, "admin-1", "all")).toEqual(
      options,
    );
  });

  it("uses the default owner only while open and preserves a user choice", () => {
    expect(studentCreateOwnerValue("", true, "sale-1")).toBe("sale-1");
    expect(studentCreateOwnerValue("sale-2", true, "sale-1")).toBe("sale-2");
    expect(studentCreateOwnerValue("", false, "sale-1")).toBe("");
  });

  it("defaults to the signed-in owner when routing access widens the read scope", () => {
    const currentUserId = studentCreateCurrentUserId({
      crm_user_id: "sale-1",
      user: "sale@example.test",
    });
    expect(
      studentCreateDefaultOwner(currentUserId, "team", "assigned"),
    ).toBe("sale-1");
  });
});
