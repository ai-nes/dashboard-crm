import { describe, expect, it } from "vitest";
import type { CurrentUser } from "@/services/api/auth";

import { getNbaAdminPermissions } from "./nba-admin-permissions";

function makeUser(
  permissions: CurrentUser["crm_doctype_permissions"],
): CurrentUser {
  return {
    user: "admin@example.test",
    email: "admin@example.test",
    full_name: "Administrator",
    user_image: null,
    roles: ["System Manager"],
    crm_profile: null,
    crm_role: null,
    crm_capabilities: [],
    crm_doctype_permissions: permissions,
  };
}

const grant = {
  row_scope: "no_case_scope",
  read: true,
  write: true,
  create: true,
  delete: true,
  export: false,
};

describe("NBA admin effective permissions", () => {
  it("does not infer edit rights from the System Manager role", () => {
    const permissions = getNbaAdminPermissions(makeUser({}));

    expect(permissions.actions).toEqual({
      canRead: false,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
      canExport: false,
    });
    expect(permissions.actionTypes.canRead).toBe(false);
    expect(permissions.timingPolicies.canUpdate).toBe(false);
  });

  it("reads grants independently for Action, Action Type, and Timing Policy", () => {
    const permissions = getNbaAdminPermissions(
      makeUser({
        "CRM Action": { ...grant, write: false, create: false, delete: false },
        "CRM Action Type": { ...grant, write: false, delete: false },
        "CRM Timing Policy": { ...grant, create: false },
      }),
    );

    expect(permissions.actions).toMatchObject({
      canRead: true,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
    });
    expect(permissions.actionTypes).toMatchObject({
      canRead: true,
      canCreate: true,
      canUpdate: false,
      canDelete: false,
    });
    expect(permissions.timingPolicies).toMatchObject({
      canRead: true,
      canCreate: false,
      canUpdate: true,
      canDelete: true,
    });
  });
});
