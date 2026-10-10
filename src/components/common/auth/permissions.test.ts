import { describe, expect, it } from "vitest";

import type { CurrentUser } from "@/services/api/auth";

import {
  canManageCrmRules,
  canConvertLeadToStudent,
  canPerformStudentAction,
  getCrmPermissions,
  getCrmDoctypePermissions,
  canReadCrmPath,
  getCrmHomePath,
} from "./permissions";

const makeUser = (overrides: Partial<CurrentUser> = {}): CurrentUser => ({
  user: "staff@example.com",
  email: "staff@example.com",
  full_name: "CRM Staff",
  user_image: null,
  roles: [],
  crm_profile: null,
  crm_role: null,
  crm_capabilities: [],
  ...overrides,
});

const makeDoctypePermission = (
  overrides: Partial<
    NonNullable<CurrentUser["crm_doctype_permissions"]>[string]
  > = {},
) => ({
  row_scope: "assigned",
  read: true,
  write: true,
  create: true,
  delete: true,
  export: false,
  ...overrides,
});

describe("effective business DocType permissions", () => {
  it("hides specialized workspaces when their backend workflow grants are missing", () => {
    const user = makeUser({
      roles: ["Admissions Director"],
      crm_doctype_permissions: {
        "CRM Rule": makeDoctypePermission({ row_scope: "no_case_scope" }),
      },
    });
    expect(canReadCrmPath("/director/admin/rules-config", user)).toBe(true);
    expect(canReadCrmPath("/director/tasks", user)).toBe(false);
    expect(canReadCrmPath("/director/admin/message-templates", user)).toBe(
      false,
    );
  });
  it("hides case routes when a saved read flag has no effective case scope", () => {
    const user = makeUser({
      crm_doctype_permissions: {
        "CRM Student": makeDoctypePermission({ row_scope: "deny" }),
        "CRM Lead": makeDoctypePermission({ row_scope: "no_case_scope" }),
      },
    });
    expect(canReadCrmPath("/director/students", user)).toBe(false);
    expect(canReadCrmPath("/director/leads/one", user)).toBe(false);
  });
  it("denies a direct Student detail URL when the saved read grant is off", () => {
    const user = makeUser({
      roles: ["Admissions Director"],
      crm_doctype_permissions: {
        "CRM Student": makeDoctypePermission({ read: false }),
        "CRM Lead": makeDoctypePermission(),
      },
    });
    expect(canReadCrmPath("/director/students/student-1", user)).toBe(false);
    expect(canReadCrmPath("/director/leads/lead-1", user)).toBe(true);
  });

  it("keeps mixed configuration screens readable when one resource is granted", () => {
    const user = makeUser({
      crm_doctype_permissions: {
        "CRM Document Type": makeDoctypePermission({
          row_scope: "no_case_scope",
        }),
      },
    });
    expect(canReadCrmPath("/director/admin/student-config", user)).toBe(true);
    expect(canReadCrmPath("/director/admin/majors", user)).toBe(false);
    expect(canReadCrmPath("/profile", user)).toBe(true);
  });

  it("does not expose all-record Director reports with an assigned-only Student grant", () => {
    const user = makeUser({
      crm_doctype_permissions: {
        "CRM Student": makeDoctypePermission({ row_scope: "assigned" }),
      },
    });
    expect(canReadCrmPath("/director", user)).toBe(false);
    expect(canReadCrmPath("/director/revenue-forecast", user)).toBe(false);
    expect(canReadCrmPath("/director/demographics", user)).toBe(false);
    expect(canReadCrmPath("/director/students", user)).toBe(true);
  });

  it("requires both school read and all-student scope for market intelligence", () => {
    const user = makeUser({
      crm_doctype_permissions: {
        "CRM High School": makeDoctypePermission({ row_scope: "all" }),
        "CRM Student": makeDoctypePermission({ row_scope: "assigned" }),
      },
    });
    expect(canReadCrmPath("/director/market-intelligence", user)).toBe(false);
    expect(
      canReadCrmPath("/director/market-intelligence", {
        ...user,
        crm_doctype_permissions: {
          ...user.crm_doctype_permissions,
          "CRM Student": makeDoctypePermission({ row_scope: "all" }),
        },
      }),
    ).toBe(true);
  });

  it("checks each activity tab against its own all-record report resources", () => {
    const user = makeUser({
      crm_doctype_permissions: {
        "CRM Student": makeDoctypePermission({ row_scope: "all" }),
        "CRM Campaign": makeDoctypePermission(),
      },
    });
    expect(canReadCrmPath("/director/activity-campaign", user)).toBe(true);
    expect(
      canReadCrmPath("/director/activity-campaign?tab=campaign", user),
    ).toBe(true);
    expect(canReadCrmPath("/director/activity-campaign?tab=field", user)).toBe(
      false,
    );
    expect(
      canReadCrmPath(
        "/director/campaign-intelligence",
        makeUser({
          crm_doctype_permissions: { "CRM Campaign": makeDoctypePermission() },
        }),
      ),
    ).toBe(false);
  });

  it("hides student AI workspaces after Student read is revoked", () => {
    expect(
      canReadCrmPath(
        "/director/ai/next-best-action",
        makeUser({
          roles: ["Admissions Director"],
          crm_doctype_permissions: {
            "CRM Student": makeDoctypePermission({
              row_scope: "all",
              read: false,
            }),
          },
        }),
      ),
    ).toBe(false);
  });

  it("requires Recommendation read as well as scoped Student read for NBA", () => {
    const user = makeUser({
      crm_doctype_permissions: {
        "CRM Student": makeDoctypePermission(),
      },
    });
    expect(canReadCrmPath("/director/ai/next-best-action", user)).toBe(false);
    expect(
      canReadCrmPath("/director/ai/next-best-action", {
        ...user,
        crm_doctype_permissions: {
          ...user.crm_doctype_permissions,
          "CRM Recommendation": makeDoctypePermission(),
        },
      }),
    ).toBe(true);
  });

  it("uses the backend administrator identity for system-wide activity logs", () => {
    expect(
      canReadCrmPath(
        "/director/admin/activity-logs",
        makeUser({ roles: ["Admissions Director"] }),
      ),
    ).toBe(false);
    expect(
      canReadCrmPath(
        "/director/admin/activity-logs",
        makeUser({ crm_is_administrator: true }),
      ),
    ).toBe(true);
  });

  it("routes directly to Profile if the role home cannot be read", () => {
    expect(getCrmHomePath(makeUser({ roles: ["Admissions Director"] }))).toBe(
      "/profile",
    );
    expect(
      getCrmHomePath(
        makeUser({
          roles: ["Admissions Director"],
          crm_doctype_permissions: {
            "CRM Student": makeDoctypePermission({ row_scope: "all" }),
          },
        }),
      ),
    ).toBe("/director");
    expect(getCrmHomePath(makeUser({ roles: ["System Manager"] }))).toBe(
      "/admin",
    );
  });

  it("does not grant missing business permissions from a Director role", () => {
    expect(
      getCrmDoctypePermissions(
        makeUser({ roles: ["Admissions Director"] }),
        "CRM Campaign",
      ),
    ).toEqual({
      canRead: false,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
      canExport: false,
    });
  });

  it("honors independent saved catalog flags without requiring a case scope", () => {
    const user = makeUser({
      crm_doctype_permissions: {
        "CRM Major": makeDoctypePermission({
          row_scope: "no_case_scope",
          create: false,
          write: false,
          delete: false,
          export: true,
        }),
      },
    });
    expect(getCrmDoctypePermissions(user, "CRM Major")).toEqual({
      canRead: true,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
      canExport: true,
    });
  });

  it("hides all actions when read is denied even if mutation flags are saved", () => {
    const user = makeUser({
      crm_doctype_permissions: {
        "CRM Campaign": makeDoctypePermission({ read: false }),
      },
    });
    expect(getCrmDoctypePermissions(user, "CRM Campaign")).toEqual({
      canRead: false,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
      canExport: false,
    });
  });
});

describe("CRM Rule administration permissions", () => {
  it.each(["System Manager", "Admissions Director", "Administrator"])(
    "allows effective rule editing for %s",
    (role) => {
      expect(
        canManageCrmRules(
          makeUser({
            roles: [role],
            crm_doctype_permissions: {
              "CRM Rule": makeDoctypePermission({ row_scope: "no_case_scope" }),
            },
          }),
        ),
      ).toBe(true);
    },
  );

  it("does not infer an effective rule editing grant from the role or identity", () => {
    expect(canManageCrmRules(makeUser({ user: "Administrator" }))).toBe(false);
    expect(
      canManageCrmRules(
        makeUser({
          roles: ["Admissions Director"],
          crm_doctype_permissions: {
            "CRM Rule": makeDoctypePermission({ write: false }),
          },
        }),
      ),
    ).toBe(false);
  });

  it("does not grant a capability-only or unrelated role access the API denies", () => {
    expect(canManageCrmRules(makeUser({ roles: ["Sale"] }))).toBe(false);
    expect(
      canManageCrmRules(
        makeUser({ roles: ["Sale"], crm_capabilities: ["rule.manage"] }),
      ),
    ).toBe(false);
  });
});

describe("CRM sales permissions", () => {
  it("hides mutations when Lead read access is denied", () => {
    const permissions = getCrmPermissions(
      makeUser({
        crm_capabilities: ["student.ownership.manage"],
        crm_doctype_permissions: {
          "CRM Lead": makeDoctypePermission({ read: false }),
        },
      }),
    ).lead;
    expect(permissions).toMatchObject({
      canCreate: false,
      canUpdate: false,
      canDelete: false,
      canAssign: false,
    });
  });
  it("requires ownership to delete even when the configured row scope is all", () => {
    const user = makeUser({
      crm_doctype_permissions: {
        "CRM Lead": {
          ...makeDoctypePermission({ row_scope: "all" }),
          delete_requires_ownership: true,
        },
      },
    });
    const permissions = getCrmPermissions(user).lead;
    expect(
      canPerformStudentAction(
        permissions,
        "delete",
        { owner: "other@example.com" },
        user,
      ),
    ).toBe(false);
    expect(
      canPerformStudentAction(
        permissions,
        "delete",
        { owner: user.email },
        user,
      ),
    ).toBe(true);
  });
  it("gives Lead Sale CRUD on every student", () => {
    const permissions = getCrmPermissions(
      makeUser({
        roles: ["Lead Sale"],
        crm_capabilities: ["student.ownership.manage"],
        crm_doctype_permissions: {
          "CRM Lead": makeDoctypePermission({ row_scope: "all" }),
          "CRM Student": makeDoctypePermission({ row_scope: "all" }),
          Task: makeDoctypePermission({ row_scope: "all" }),
        },
      }),
    );

    expect(permissions.student).toMatchObject({
      scope: "all",
      canCreate: true,
      canRead: true,
      canUpdate: true,
      canDelete: true,
    });
  });

  it("lets Sale read the pool/team but update only assigned students", () => {
    const user = makeUser({
      user: "sale@example.com",
      email: "sale@example.com",
      full_name: "Nguyễn Văn Sale",
      roles: ["Sale"],
      crm_capabilities: ["student.ownership.manage", "student.routing.read"],
      crm_doctype_permissions: {
        "CRM Lead": makeDoctypePermission({ delete: false }),
        "CRM Student": makeDoctypePermission({ delete: false }),
        Task: makeDoctypePermission(),
      },
    });
    const permissions = getCrmPermissions(user);
    const assignedStudent = { owner: "sale@example.com" };

    expect(permissions.student).toMatchObject({
      scope: "assigned",
      readScope: "team",
    });
    expect(
      canPerformStudentAction(
        permissions.student,
        "read",
        { owner: "other@example.com" },
        user,
      ),
    ).toBe(true);
    expect(
      canPerformStudentAction(
        permissions.student,
        "create",
        assignedStudent,
        user,
      ),
    ).toBe(true);
    expect(
      canPerformStudentAction(
        permissions.student,
        "delete",
        assignedStudent,
        user,
      ),
    ).toBe(false);
    expect(permissions.student.canAssign).toBe(true);
    expect(
      canPerformStudentAction(
        permissions.student,
        "update",
        { owner: "other@example.com" },
        user,
      ),
    ).toBe(false);
  });

  it("gives CTV Sale RU on assigned students and no task creation", () => {
    const permissions = getCrmPermissions(
      makeUser({
        roles: ["CTV Sale"],
        crm_doctype_permissions: {
          "CRM Lead": makeDoctypePermission({ create: false, delete: false }),
          "CRM Student": makeDoctypePermission({
            create: false,
            delete: false,
          }),
          Task: makeDoctypePermission({ create: false, delete: false }),
        },
      }),
    );

    expect(permissions.student).toMatchObject({
      scope: "assigned",
      canCreate: false,
      canRead: true,
      canUpdate: true,
      canDelete: false,
      canAssign: false,
    });
    expect(permissions.task.canCreate).toBe(false);
    expect(permissions.lead.canAssign).toBe(false);
  });

  it("uses effective DocType flags instead of the role label for CUD", () => {
    const permissions = getCrmPermissions(
      makeUser({
        roles: ["Sale"],
        crm_doctype_permissions: {
          "CRM Lead": makeDoctypePermission({
            create: false,
            delete: true,
          }),
          "CRM Student": makeDoctypePermission({
            create: false,
            delete: true,
          }),
          Task: makeDoctypePermission(),
        },
      }),
    );

    expect(permissions.lead).toMatchObject({
      canCreate: false,
      canDelete: true,
    });
    expect(permissions.student).toMatchObject({
      canCreate: false,
      canDelete: true,
    });
  });

  it("fails closed when the session has no effective DocType payload", () => {
    const permissions = getCrmPermissions(makeUser({ roles: ["Lead Sale"] }));

    expect(permissions.lead).toMatchObject({
      canCreate: false,
      canUpdate: false,
      canDelete: false,
    });
    expect(permissions.student.canCreate).toBe(false);
  });

  it("limits Lead conversion to Sales roles and assigned records", () => {
    const sale = {
      user: "sale@example.com",
      email: "sale@example.com",
      full_name: "Nguyễn Văn Sale",
    } as CurrentUser;
    const assignedLead = { owner: "sale@example.com" };
    const otherLead = { owner: "other@example.com" };

    expect(canConvertLeadToStudent(["Sale"], assignedLead, sale)).toBe(true);
    expect(canConvertLeadToStudent(["Sale"], otherLead, sale)).toBe(false);
    expect(canConvertLeadToStudent(["CTV Sale"], assignedLead, sale)).toBe(
      true,
    );
    expect(canConvertLeadToStudent(["Lead Sale"], otherLead, sale)).toBe(true);
    expect(
      canConvertLeadToStudent(["Admissions Director"], assignedLead, sale),
    ).toBe(false);
  });
});
