import { describe, expect, it } from "vitest";
import type { CurrentUser } from "@/services/api/auth";
import { canReadCrmPath, getCrmDoctypePermissions } from "./permissions";
import { canAccessDashboardPath } from "./rbac";
import { getNavigationDataForRoles } from "../sidebar/data";
import {
  filterNavigationByPermissions,
  filterNavigationByRoles,
} from "../sidebar/utils";

describe("profile option administrator configuration", () => {
  it("places profile catalogs immediately after admissions catalogs", () => {
    const sections = getNavigationDataForRoles(["System Manager"], {
      isAdministrator: true,
    });
    const configuration = sections.find(
      (section) => section.label === "CẤU HÌNH",
    )!;
    const admissionsIndex = configuration.items.findIndex(
      (item) => item.url === "/director/admin/majors",
    );
    expect(admissionsIndex).toBeGreaterThanOrEqual(0);
    expect(configuration.items[admissionsIndex + 1]?.url).toBe(
      "/admin/profile-options",
    );
  });
  it.each([true, false])(
    "uses effective administrator identity: %s",
    (isAdministrator) => {
      const user = {
        user: "admin@example.test",
        email: "admin@example.test",
        full_name: "Admin",
        user_image: null,
        crm_profile: null,
        crm_role: null,
        roles: ["System Manager"],
        crm_is_administrator: isAdministrator,
        crm_capabilities: ["system.configure"],
        crm_doctype_permissions: {
          "CRM Profile Option": {
            read: true,
            write: false,
            create: false,
            delete: false,
            export: false,
            row_scope: "no_case_scope",
          },
        },
      } satisfies CurrentUser;
      expect(canReadCrmPath("/admin/profile-options", user)).toBe(
        isAdministrator,
      );
      expect(
        canAccessDashboardPath(
          "/admin/profile-options",
          user.roles,
          user.crm_capabilities,
          isAdministrator,
        ),
      ).toBe(isAdministrator);
      const nav = filterNavigationByPermissions(
        filterNavigationByRoles(
          getNavigationDataForRoles(user.roles, {
            isAdministrator,
            capabilities: user.crm_capabilities,
          }),
          user.roles,
        ),
        user,
      );
      expect(
        nav
          .flatMap((section) => section.items)
          .some((item) => item.url === "/admin/profile-options"),
      ).toBe(isAdministrator);
      expect(
        getCrmDoctypePermissions(user, "CRM Profile Option").canCreate,
      ).toBe(isAdministrator);
    },
  );
});
