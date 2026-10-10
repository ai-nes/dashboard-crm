import { describe, expect, it, vi } from "vitest";
import { nestGetCurrentUser, rolesForProfile } from "./nest-auth";
import {
  canAccessDashboardPath,
  getDefaultRouteForRoles,
} from "@/components/common/auth/rbac";
import { nestRequest } from "./nest-client";
vi.mock("./nest-client", () => ({
  nestRequest: vi.fn(),
  NestApiError: class extends Error {},
}));

describe("Nest Director workspace roles", () => {
  it("keeps CEO and assigned Director administrators in their business workspace", () => {
    const ceoRoles = rolesForProfile("ceo", "admin");
    expect(getDefaultRouteForRoles(ceoRoles)).toBe("/director");
    expect(canAccessDashboardPath("/director/students", ceoRoles)).toBe(true);
    const directorRoles = rolesForProfile("admissions_director", "admin");
    expect(getDefaultRouteForRoles(directorRoles)).toBe("/director");
    expect(canAccessDashboardPath("/director/students", directorRoles)).toBe(
      true,
    );
  });

  it("keeps an identity administrator without a CRM profile in the technical workspace", () => {
    const roles = rolesForProfile(null, "admin");
    expect(getDefaultRouteForRoles(roles)).toBe("/admin");
    expect(canAccessDashboardPath("/director/students", roles)).toBe(false);
  });
});
describe("Nest effective Lead permissions", () => {
  it("preserves backend identity for ownership and administrator checks", async () => {
    vi.mocked(nestRequest).mockResolvedValue({
      data: {
        id: "director-account-id",
        email: "director@example.test",
        name: "Director",
        crmProfile: "admissions_director",
        identityRole: "user",
        crmCapabilities: [],
        crmDoctypePermissions: {},
      },
    });
    expect(await nestGetCurrentUser()).toMatchObject({
      crm_user_id: "director-account-id",
      crm_is_administrator: false,
    });
    vi.mocked(nestRequest).mockResolvedValue({
      data: {
        id: "ceo-account-id",
        email: "ceo@example.test",
        name: "CEO",
        crmProfile: "ceo",
        identityRole: "admin",
        crmCapabilities: [],
        crmDoctypePermissions: {},
      },
    });
    expect(await nestGetCurrentUser()).toMatchObject({
      crm_user_id: "ceo-account-id",
      crm_is_administrator: true,
    });
  });
  it("does not fabricate Student or Task grants from student.execute", async () => {
    vi.mocked(nestRequest).mockResolvedValue({
      data: {
        email: "director@example.test",
        name: "Director",
        crmProfile: "admissions_director",
        identityRole: "user",
        leadScope: "all",
        crmCapabilities: [{ key: "student.execute" }],
        crmDoctypePermissions: {},
      },
    });
    expect((await nestGetCurrentUser())?.crm_doctype_permissions).toEqual({});
  });

  it("preserves all effective business permissions from the backend", async () => {
    const permissions = {
      "CRM Student": {
        row_scope: "all",
        read: true,
        write: false,
        create: false,
        delete: false,
        export: false,
      },
      "CRM Campaign": {
        row_scope: "no_case_scope",
        read: true,
        write: false,
        create: false,
        delete: false,
        export: true,
      },
    };
    vi.mocked(nestRequest).mockResolvedValue({
      data: {
        email: "director@example.test",
        name: "Director",
        crmProfile: "admissions_director",
        identityRole: "user",
        leadScope: "all",
        crmCapabilities: [{ key: "student.execute" }],
        crmDoctypePermissions: permissions,
      },
    });
    expect((await nestGetCurrentUser())?.crm_doctype_permissions).toEqual(
      permissions,
    );
  });

  it("uses saved false flags even when student.execute is granted", async () => {
    const lead = {
      row_scope: "all",
      read: true,
      write: true,
      create: false,
      delete: false,
      export: false,
      delete_requires_ownership: true,
    };
    vi.mocked(nestRequest).mockResolvedValue({
      data: {
        email: "lead@example.test",
        name: "Lead",
        crmProfile: "lead_sales",
        identityRole: "user",
        leadScope: "all",
        crmCapabilities: [{ key: "student.execute" }],
        crmDoctypePermissions: { "CRM Lead": lead },
      },
    });
    expect(
      (await nestGetCurrentUser())?.crm_doctype_permissions?.["CRM Lead"],
    ).toEqual(lead);
  });
});
