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
    const permissions = getCrmPermissions(["Lead Sale"]);

    expect(permissions.student).toMatchObject({
      scope: "all",
      canCreate: true,
      canRead: true,
      canUpdate: true,
      canDelete: true,
    });
  });

  it("lets Sale read the pool/team but update only assigned students", () => {
    const permissions = getCrmPermissions(["Sale"]);
    const assignedStudent = { owner: "sale@example.com" };
    const user = {
      user: "sale@example.com",
      email: "sale@example.com",
      full_name: "Nguyễn Văn Sale",
    } as CurrentUser;

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
    const permissions = getCrmPermissions(["CTV Sale"]);

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
