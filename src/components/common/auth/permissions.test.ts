import { describe, expect, it } from "vitest";

import type { CurrentUser } from "@/services/api/auth";

import {
  canConvertLeadToStudent,
  canPerformStudentAction,
  getCrmPermissions,
} from "./permissions";

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
