import { describe, expect, it } from "vitest";
import {
  CRM_ROLES,
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
    expect(CRM_ROLES).toEqual([
      "CTV Sale",
      "Sale",
      "Lead Sale",
      "Promoter",
      "Lead Promoter",
      "Marketing",
      "Lead Marketing",
      "Admissions Director",
      "Business Admin",
      "Administrator",
    ]);
    expect(getRecognizedRoles(["Sale", "sale", " Sale "])).toEqual(["Sale"]);
    expect(getRecognizedRoles(["Administrator", "CEO", "System Manager"])).toEqual([
      "Administrator",
    ]);
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

  it("resolves /admin/users to the /admin route rule", () => {
    expect(findRouteAccessRule("/admin/users")?.path).toBe("/admin");
    expect(canAccessDashboardPath("/admin/users", ["System Manager"])).toBe(true);
    expect(canAccessDashboardPath("/admin/users", ["Administrator"])).toBe(true);
    expect(canAccessDashboardPath("/admin/users", ["Sale"])).toBe(false);
  });

  it("allows the Rule Engine route from the backend capability", () => {
    expect(
      canAccessDashboardPath("/director/admin/rules-config", ["Lead Sale"], ["rule.manage"]),
    ).toBe(true);
    expect(
      canAccessDashboardPath("/director/admin/rules-config", ["Lead Sale"], []),
    ).toBe(false);
  });

  it("uses the canonical Lead Sale segments route", () => {
    const leadSaleNavigation = filterNavigationByRoles(
      getNavigationDataForRoles(["Lead Sale"]),
      ["Lead Sale"],
    );

    expect(getNavigationUrls(leadSaleNavigation)).toContain(
      "/lead-sale/segments",
    );
    expect(
      findRouteAccessRule("/lead-sale/segments/SEG-001")?.path,
    ).toBe("/lead-sale/segments");
    expect(
      canAccessDashboardPath("/lead-sale/segments/SEG-001", ["Lead Sale"]),
    ).toBe(true);
  });

  it("protects school detail aliases with the school intelligence permission", () => {
    expect(
      canAccessDashboardPath("/director/schools/HIGH-001", ["Promoter"]),
    ).toBe(true);
    expect(canAccessDashboardPath("/director/school/123", ["CTV Sale"])).toBe(
      true,
    );
  });

  it("allows unlisted non-dashboard screens to keep their existing behavior", () => {
    expect(canAccessDashboardPath("/profile", [])).toBe(true);
  });

  it("limits Team Management to Sales organization roles", () => {
    expect(
      canAccessDashboardPath("/lead-sale/team-management", ["Lead Sale"]),
    ).toBe(true);
    expect(canAccessDashboardPath("/lead-sale/team-management", ["Sale"])).toBe(
      true,
    );
    expect(
      canAccessDashboardPath("/lead-sale/team-management", ["CTV Sale"]),
    ).toBe(true);
    expect(
      canAccessDashboardPath("/lead-sale/team-management", [
        "Admissions Director",
      ]),
    ).toBe(false);
    expect(
      canAccessDashboardPath("/lead-sale/team-management", ["Administrator"]),
    ).toBe(false);
    expect(
      canAccessDashboardPath("/lead-sale/team-management", ["System Manager"]),
    ).toBe(true);
  });

  it("returns a role-specific fallback when a route is blocked", () => {
    expect(getDefaultRouteForRoles(["Promoter"])).toBe(
      "/director/school-field-activity",
    );
    expect(getDefaultRouteForRoles(["Marketing"])).toBe(
      "/marketing",
    );
    expect(getDefaultRouteForRoles(["Administrator"])).toBe("/director");
    expect(getDefaultRouteForRoles(["System Manager"])).toBe("/admin");
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
      "Quản lý task",
      "Chatbot CRM",
      "Trung tâm AI & dữ liệu",
      "Khám phá người học",
      "Hồ sơ học sinh 360°",
      "Trường THPT 360°",
      "Hiệu suất khu vực",
      "Phễu tuyển sinh",
      "Phân tích xu hướng",
      "Hoạt động & chiến dịch",
    ]);
    expect(getNavigationUrls(directorNavigation)).toHaveLength(11);
    expect(getNavigationUrls(directorNavigation)[0]).toBe("/director");
    expect(
      getNavigationUrls(filterNavigationByRoles(DIRECTOR_NAV_DATA, ["Admissions Director"])),
      ).toHaveLength(11);
    expect(
      getNavigationUrls(
        filterNavigationByRoles(
          getNavigationDataForRoles(["Administrator"]),
          ["Administrator"],
        ),
      ),
       ).toHaveLength(11);
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
      "/director/ai",
      "/director/data-health",
      "/director/alerts",
      "/admin/users",
      "/director/admin/nba-actions",
      "/director/admin/segments",
      "/director/admin/rules-config",
      "/director/admin/student-config",
      "/director/admin/activity-logs",
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

  it("shows the school 360 workspace to Sale, CTV Sale, and Lead Sale", () => {
    const school360Url = "/director/market-intelligence";
    const roles = ["Sale", "CTV Sale", "Lead Sale"] as const;

    for (const role of roles) {
      expect(
        getNavigationUrls(
          filterNavigationByRoles(getNavigationDataForRoles([role]), [role]),
        ),
      ).toContain(school360Url);
      expect(canAccessDashboardPath(school360Url, [role])).toBe(true);
    }
  });

  it("exposes the lead list only in each sales role's workspace", () => {
    expect(canAccessDashboardPath("/sale/leads", ["Sale"])).toBe(true);
    expect(canAccessDashboardPath("/ctv-sale/leads", ["CTV Sale"])).toBe(
      true,
    );
    expect(canAccessDashboardPath("/sale/leads", ["CTV Sale"])).toBe(false);
    expect(canAccessDashboardPath("/ctv-sale/leads", ["Sale"])).toBe(false);

    expect(
      getNavigationUrls(
        filterNavigationByRoles(getNavigationDataForRoles(["Sale"]), [
          "Sale",
        ]),
      ),
    ).toContain("/sale/leads");
    expect(
      getNavigationUrls(
        filterNavigationByRoles(getNavigationDataForRoles(["CTV Sale"]), [
          "CTV Sale",
        ]),
      ),
    ).toContain("/ctv-sale/leads");
  });

  it("exposes the campaign list only in each sales role's workspace", () => {
    expect(canAccessDashboardPath("/sale/campaigns", ["Sale"])).toBe(true);
    expect(canAccessDashboardPath("/ctv-sale/campaigns", ["CTV Sale"])).toBe(
      true,
    );
    expect(canAccessDashboardPath("/sale/campaigns", ["CTV Sale"])).toBe(
      false,
    );
    expect(canAccessDashboardPath("/ctv-sale/campaigns", ["Sale"])).toBe(
      false,
    );

    expect(
      getNavigationUrls(
        filterNavigationByRoles(getNavigationDataForRoles(["Sale"]), [
          "Sale",
        ]),
      ),
    ).toContain("/sale/campaigns");
    expect(
      getNavigationUrls(
        filterNavigationByRoles(getNavigationDataForRoles(["CTV Sale"]), [
          "CTV Sale",
        ]),
      ),
    ).toContain("/ctv-sale/campaigns");
  });
});
