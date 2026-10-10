import { describe, expect, it } from "vitest";
import type { CurrentUser } from "@/services/api/auth";

import {
  getMajorCatalogPermissions,
  getStudentConfigurationPermissions,
} from "./student-configuration-permissions";

const user = (
  permissions: NonNullable<CurrentUser["crm_doctype_permissions"]>,
): CurrentUser =>
  ({
    user: "configurer@example.test",
    email: "configurer@example.test",
    full_name: "Configurer",
    user_image: null,
    roles: ["System Manager"],
    crm_profile: null,
    crm_role: null,
    crm_capabilities: [],
    crm_doctype_permissions: permissions,
  }) as CurrentUser;

describe("Director configuration permissions", () => {
  it("fails closed when effective DocType flags are missing despite a role", () => {
    const noGrants = user({});

    expect(getStudentConfigurationPermissions(noGrants).needs).toEqual({
      canRead: false,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
      canExport: false,
    });
    expect(getMajorCatalogPermissions(noGrants).majors.canUpdate).toBe(false);
  });

  it("keeps create, update, and delete grants separate by catalog", () => {
    const permissions = getStudentConfigurationPermissions(
      user({
        "CRM Need": {
          read: true,
          write: true,
          create: false,
          delete: false,
          export: false,
        },
        "CRM Tag": {
          read: true,
          write: false,
          create: true,
          delete: true,
          export: false,
        },
      }),
    );

    expect(permissions.needs).toMatchObject({
      canRead: true,
      canCreate: false,
      canUpdate: true,
      canDelete: false,
    });
    expect(permissions.tags).toMatchObject({
      canRead: true,
      canCreate: true,
      canUpdate: false,
      canDelete: true,
    });
    expect(permissions.admissionProfileTemplates.canRead).toBe(false);
  });
});
