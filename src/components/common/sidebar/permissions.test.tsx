import { describe, expect, it } from "vitest";
import type { CurrentUser } from "@/services/api/auth";
import { filterNavigationByPermissions } from "./utils";
import type { NavigationSection } from "./data";

describe("sidebar effective resource permissions", () => {
  it("removes denied links and groups with no permitted children", () => {
    const user: CurrentUser = {
      user: "director@example.test",
      email: "director@example.test",
      full_name: "Director",
      user_image: null,
      roles: ["Admissions Director"],
      crm_profile: "admissions_director",
      crm_role: "Admissions Director",
      crm_capabilities: [],
      crm_doctype_permissions: {
        "CRM Lead": {
          read: true,
          write: false,
          create: false,
          delete: false,
          export: false,
          row_scope: "all",
        },
      },
    };
    const navigation: NavigationSection[] = [
      {
        label: "Director",
        items: [
          { title: "Tổng quan", url: "/", roles: ["Admissions Director"] },
          {
            title: "Học sinh",
            url: "/director/students",
            roles: ["Admissions Director"],
          },
          {
            title: "Lead",
            url: "/director/leads",
            roles: ["Admissions Director"],
          },
          {
            title: "Trường",
            roles: ["Admissions Director"],
            items: [
              {
                title: "Danh sách",
                url: "/director/schools",
                roles: ["Admissions Director"],
              },
            ],
          },
        ],
      },
    ];
    expect(
      filterNavigationByPermissions(navigation, user)[0].items.map(
        (item) => item.title,
      ),
    ).toEqual(["Lead"]);
  });
});
