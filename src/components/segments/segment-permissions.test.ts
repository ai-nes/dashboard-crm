import { describe, expect, it } from "vitest";
import type { CurrentUser } from "@/services/api/auth";

import { canCreateSegment, canManageSegment, canReadSegments } from "./segment-permissions";

const segment = { ownerUserId: "account-owner" };

function makeUser(overrides: Partial<CurrentUser> = {}): CurrentUser {
  return {
    user: "director@example.test",
    email: "director@example.test",
    full_name: "Director",
    user_image: null,
    roles: ["Admissions Director"],
    crm_profile: "admissions_director",
    crm_role: "Admissions Director",
    crm_capabilities: [],
    crm_user_id: "account-owner",
    crm_doctype_permissions: {
      "CRM Segment": {
        row_scope: "no_case_scope",
        read: true,
        write: true,
        create: true,
        delete: true,
        export: false,
      },
    },
    ...overrides,
  };
}

describe("segment effective permissions", () => {
  it("allows the owner to edit and create when the server grants those flags", () => {
    const user = makeUser();

    expect(canReadSegments(user)).toBe(true);
    expect(canCreateSegment(user)).toBe(true);
    expect(canManageSegment(user, segment, "update")).toBe(true);
  });

  it("denies row edits when the owner differs and no team authority exists", () => {
    const user = makeUser({ crm_user_id: "another-account" });

    expect(canManageSegment(user, segment, "update")).toBe(false);
    expect(canManageSegment(user, segment, "delete")).toBe(false);
  });

  it("honors independent delete and team-oversee grants", () => {
    const user = makeUser({
      crm_user_id: "another-account",
      crm_capabilities: ["team.oversee"],
      crm_doctype_permissions: {
        "CRM Segment": {
          row_scope: "no_case_scope",
          read: true,
          write: false,
          create: false,
          delete: true,
          export: false,
        },
      },
    });

    expect(canManageSegment(user, segment, "update")).toBe(false);
    expect(canManageSegment(user, segment, "delete")).toBe(true);
  });

  it("requires a saved read grant even when the account has mutation flags", () => {
    const user = makeUser({
      crm_doctype_permissions: {
        "CRM Segment": {
          row_scope: "no_case_scope",
          read: false,
          write: true,
          create: true,
          delete: true,
          export: false,
        },
      },
    });

    expect(canReadSegments(user)).toBe(false);
    expect(canCreateSegment(user)).toBe(false);
    expect(canManageSegment(user, segment, "update")).toBe(false);
  });
});
