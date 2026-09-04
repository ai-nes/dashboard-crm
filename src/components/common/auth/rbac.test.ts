import { describe, expect, it } from "vitest";
import {
  canAccessDashboardPath,
  findRouteAccessRule,
  getDefaultRouteForRoles,
  getRecognizedRoles,
} from "./rbac";
import { filterNavigationByRoles } from "../sidebar/utils";
import { NAV_DATA, type NavigationSection } from "../sidebar/data";

describe("dashboard RBAC", () => {
  it("matches only canonical role names", () => {
    expect(getRecognizedRoles(["Sale", "sale", " Sale "])).toEqual(["Sale"]);
  });

  it("uses the most specific rule for nested routes", () => {
    expect(findRouteAccessRule("/director/ai/next-best-action/ABC")?.path).toBe(
      "/director/ai/next-best-action",
    );
    expect(
      canAccessDashboardPath("/director/ai/next-best-action/ABC", ["Sale"]),
    ).toBe(true);
    expect(
      canAccessDashboardPath("/director/ai/next-best-action/ABC", [
        "Marketing",
      ]),
    ).toBe(false);
  });

  it("protects school detail aliases with the school intelligence permission", () => {
    expect(
      canAccessDashboardPath("/director/schools/HIGH-001", ["Promoter"]),
    ).toBe(true);
    expect(canAccessDashboardPath("/director/school/123", ["CTV Sale"])).toBe(
      false,
    );
  });

  it("allows unlisted non-dashboard screens to keep their existing behavior", () => {
    expect(canAccessDashboardPath("/profile", [])).toBe(true);
  });

  it("returns a role-specific fallback when a route is blocked", () => {
    expect(getDefaultRouteForRoles(["Promoter"])).toBe(
      "/director/school-field-activity",
    );
    expect(getDefaultRouteForRoles(["Marketing"])).toBe(
      "/director/campaign-intelligence",
    );
    expect(getDefaultRouteForRoles(["System Manager"])).toBe("/");
  });

  it("filters sidebar items with the same exact-role contract", () => {
    const navigation: NavigationSection[] = [
      {
        label: "CRM",
        items: [
          { title: "Sale", url: "/sale", roles: ["Sale"] },
          { title: "Marketing", url: "/marketing", roles: ["Marketing"] },
        ],
      },
    ];

    expect(
      filterNavigationByRoles(navigation, ["Sale"]).flatMap((section) =>
        section.items.map((item) => item.title),
      ),
    ).toEqual(["Sale"]);
    expect(filterNavigationByRoles(navigation, ["sale"])).toEqual([]);
  });

  it("keeps System Manager on the small administration workspace", () => {
    const systemManagerItems = filterNavigationByRoles(NAV_DATA, [
      "System Manager",
    ]).flatMap((section) => section.items.map((item) => item.url));

    expect(systemManagerItems).toEqual([
      "/",
      "/director/ai/next-best-action",
      "/director/ai",
      "/director/data-health",
      "/director/alerts",
      "/director/admin/nba-actions",
    ]);
    expect(
      canAccessDashboardPath("/director/students", ["System Manager"]),
    ).toBe(false);
    expect(canAccessDashboardPath("/crm-chatbot", ["System Manager"])).toBe(
      false,
    );
    expect(canAccessDashboardPath("/director/alerts", ["System Manager"])).toBe(
      true,
    );
    expect(
      canAccessDashboardPath("/director/students", ["System Manager", "Sale"]),
    ).toBe(false);
    expect(
      filterNavigationByRoles(NAV_DATA, ["System Manager", "Sale"]).flatMap(
        (section) => section.items.map((item) => item.url),
      ),
    ).toEqual(systemManagerItems);
  });
});
