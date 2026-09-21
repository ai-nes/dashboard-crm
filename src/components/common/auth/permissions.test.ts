import { describe, expect, it } from "vitest";

import type { CurrentUser } from "@/services/api/auth";

import {
  canManageCrmRules,
  canConvertLeadToStudent,
  canPerformStudentAction,
  getCrmPermissions,
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
  csrf_token: null,
  ...overrides,
});

const makeDoctypePermission = (
  overrides: Partial<NonNullable<CurrentUser["crm_doctype_permissions"]>[string]> = {},
) => ({
  row_scope: "assigned",
  read: true,
  write: true,
  create: true,
  delete: true,
  export: false,
  ...overrides,
});

describe("CRM Rule administration permissions", () => {
  it.each(["System Manager", "Admissions Director", "Business Admin"])(
    "allows the backend-authorized %s role",
    (role) => {
      expect(canManageCrmRules(makeUser({ roles: [role] }))).toBe(true);
    },
  );

  it("allows the Administrator identity", () => {
    expect(canManageCrmRules(makeUser({ user: "Administrator" }))).toBe(true);
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
      crm_capabilities: [
        "student.ownership.manage",
        "student.routing.read",
      ],
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
