import { describe, expect, it } from "vitest";
import type { CurrentUser } from "@/services/api/auth";

import {
  canCreateSegment,
  canManageSegment,
  canReadSegments,
} from "./segment-permissions";

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
    crm_is_administrator: false,
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
  it("allows administrators to edit and create", () => {
    const user = makeUser({ crm_is_administrator: true });

    expect(canReadSegments(user)).toBe(true);
    expect(canCreateSegment(user)).toBe(true);
    expect(canManageSegment(user, segment, "update")).toBe(true);
  });

  it("allows administrators to manage segments belonging to other accounts", () => {
    const user = makeUser({
      crm_user_id: "another-account",
      crm_is_administrator: true,
    });

    expect(canManageSegment(user, segment, "update")).toBe(true);
    expect(canManageSegment(user, segment, "delete")).toBe(true);
  });

  it.each(["lead_sales", "sales", "ctv_sale", "admissions_director"])(
    "denies %s mutations even with stale grants, ownership and team authority",
    (profile) => {
      const user = makeUser({
        roles: ["Lead Sales"],
        crm_profile: profile,
        crm_is_administrator: false,
        crm_capabilities: ["team.oversee"],
      });

      expect(canReadSegments(user)).toBe(true);
      expect(canCreateSegment(user)).toBe(false);
      expect(canManageSegment(user, segment, "update")).toBe(false);
      expect(canManageSegment(user, segment, "delete")).toBe(false);
    },
  );

  it("does not let team authority grant Segment mutations", () => {
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
    expect(canManageSegment(user, segment, "delete")).toBe(false);
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
