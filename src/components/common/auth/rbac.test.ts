import { describe, expect, it } from "vitest";
import {
  canAccessDashboardPath,
  findRouteAccessRule,
  getDefaultRouteForRoles,
  getRecognizedRoles,
} from "./rbac";
import {
  filterNavigationByRoles,
  findActiveGroupKeyInNavigation,
} from "../sidebar/utils";
import {
  DIRECTOR_NAV_DATA,
  NAV_DATA,
  getNavigationDataForRoles,
  type NavigationSection,
} from "../sidebar/data";

function getNavigationUrls(navigation: NavigationSection[]): string[] {
  return navigation.flatMap((section) =>
    section.items.flatMap((item) =>
      item.items?.length
        ? item.items.flatMap((child) => (child.url ? [child.url] : []))
        : item.url
          ? [item.url]
          : [],
    ),
  );
}

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

  it("keeps the director workspace flat and free of configuration", () => {
    const directorNavigation = filterNavigationByRoles(
      getNavigationDataForRoles(["Admissions Director"]),
      ["Admissions Director"],
    );
    const primaryItems = directorNavigation.flatMap((section) =>
      section.items.map((item) => item.title),
    );

    expect(primaryItems).toEqual([
      "Tổng quan tuyển sinh",
      "Việc cần xử lý",
      "Chatbot CRM",
      "Trung tâm AI & dữ liệu",
      "Khám phá người học",
      "Hồ sơ học sinh 360°",
      "Trường THPT 360°",
      "Hiệu suất khu vực",
      "Phễu tuyển sinh",
      "Phân tích xu hướng",
      "Quản lý task",
      "Hoạt động & chiến dịch",
    ]);
    expect(directorNavigation).toEqual(
      filterNavigationByRoles(DIRECTOR_NAV_DATA, ["Admissions Director"]),
    );
    expect(getNavigationUrls(directorNavigation)).toHaveLength(12);
    expect(primaryItems).not.toContain("Cấu hình Action NBA");
    expect(
      findActiveGroupKeyInNavigation("/director/ai", directorNavigation),
    ).toBeNull();
    expect(
      findActiveGroupKeyInNavigation(
        "/director/ai/next-best-action",
        directorNavigation,
      ),
    ).toBeNull();
  });

  it("keeps System Manager on the small administration workspace", () => {
    const systemManagerItems = getNavigationUrls(
      filterNavigationByRoles(NAV_DATA, ["System Manager"]),
    );

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
      getNavigationUrls(
        filterNavigationByRoles(NAV_DATA, ["System Manager", "Sale"]),
      ),
    ).toEqual(systemManagerItems);
  });

  it("reserves NBA configuration for System Manager", () => {
    const configurationUrl = "/director/admin/nba-actions";

    expect(
      getNavigationUrls(filterNavigationByRoles(NAV_DATA, ["Sale"])),
    ).not.toContain(configurationUrl);
    expect(canAccessDashboardPath(configurationUrl, ["Sale"])).toBe(false);
    expect(
      canAccessDashboardPath(
        "/director/admin/action-recommendations",
        ["Admissions Director"],
      ),
    ).toBe(false);
    expect(
      canAccessDashboardPath(configurationUrl, ["System Manager"]),
    ).toBe(true);
  });
});
