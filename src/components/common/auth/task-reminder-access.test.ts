import { describe, expect, it } from "vitest";
import { canAccessDashboardPath } from "./rbac";
import { canReadCrmPath } from "./permissions";
import { getNavigationDataForRoles } from "../sidebar/data";
import {
  filterNavigationByPermissions,
  filterNavigationByRoles,
} from "../sidebar/utils";
import type { CurrentUser } from "@/services/api/auth";

describe("task reminder capability access", () => {
  it("shows identity administrators without profile capabilities in CẤU HÌNH", () => {
    const user: CurrentUser = {
      user: "admin@example.test",
      email: "admin@example.test",
      full_name: "Admin",
      user_image: null,
      crm_profile: null,
      crm_role: null,
      roles: ["System Manager", "Administrator"],
      crm_is_administrator: true,
      crm_capabilities: [],
    };
    expect(canReadCrmPath("/admin/task-reminders", user)).toBe(true);
    expect(
      canAccessDashboardPath("/admin/task-reminders", user.roles, [], true),
    ).toBe(true);
    const navigation = filterNavigationByPermissions(
      filterNavigationByRoles(
        getNavigationDataForRoles(user.roles, {
          capabilities: [],
          isAdministrator: true,
        }),
        user.roles,
      ),
      user,
    );
    expect(
      navigation
        .find((section) => section.label === "CẤU HÌNH")
        ?.items.some((item) => item.url === "/admin/task-reminders"),
    ).toBe(true);
    expect(
      navigation.some((section) => section.label === "EMAIL NHẮC VIỆC"),
    ).toBe(false);
  });
  it.each([
    "System Manager",
    "Administrator",
    "Admissions Director",
    "Sale",
    "CTV Sale",
  ])("uses system.configure rather than %s role grants", (role) => {
    for (const permitted of [true, false]) {
      const capabilities = permitted ? ["system.configure"] : [];
      const user = {
        roles: [role],
        crm_capabilities: capabilities,
      } as CurrentUser;
      expect(canReadCrmPath("/admin/task-reminders", user)).toBe(permitted);
      expect(
        canAccessDashboardPath(
          "/admin/task-reminders",
          user.roles,
          capabilities,
        ),
      ).toBe(permitted);
      const navigation = filterNavigationByPermissions(
        filterNavigationByRoles(
          getNavigationDataForRoles(user.roles, { capabilities }),
          user.roles,
        ),
        user,
      );
      expect(
        navigation
          .flatMap((section) => section.items)
          .some((item) => item.url === "/admin/task-reminders"),
      ).toBe(permitted);
    }
  });
});
