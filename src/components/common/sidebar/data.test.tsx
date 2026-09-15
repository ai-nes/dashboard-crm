import { describe, expect, it } from "vitest";

import { getNavigationDataForRoles } from "./data";
import { filterNavigationByRoles } from "./utils";

describe("sidebar navigation", () => {
  it("exposes Major management as a direct admin entry", () => {
    const adminNavigation = filterNavigationByRoles(
      getNavigationDataForRoles(["Administrator"]),
      ["Administrator"],
    );
    const configurationSection = adminNavigation.find(
      (section) => section.label === "CẤU HÌNH",
    );
    const majorEntry = configurationSection?.items.find(
      (item) => item.title === "Quản lý ngành học",
    );

    expect(majorEntry).toMatchObject({
      url: "/director/admin/majors",
    });
  });
});
