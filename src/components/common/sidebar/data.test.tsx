import { describe, expect, it } from "vitest";

import { getNavigationDataForRoles } from "./data";
import { filterNavigationByRoles } from "./utils";

describe("sidebar navigation", () => {
  it.each([
    ["CTV Sale", "/ctv-sale/snippest"],
    ["Sale", "/sale/snippest"],
    ["Lead Sale", "/lead-sale/snippest"],
  ])("labels the Snippet entry consistently for %s", (role, url) => {
    const navigation = getNavigationDataForRoles([role]);
    const snippetEntry = navigation
      .flatMap((section) => section.items)
      .find((item) => item.url === url);

    expect(snippetEntry).toMatchObject({ title: "Snippet", url });
  });

  it("exposes admission catalog management as a direct admin entry", () => {
    const adminNavigation = filterNavigationByRoles(
      getNavigationDataForRoles(["Administrator"]),
      ["Administrator"],
    );
    const configurationSection = adminNavigation.find(
      (section) => section.label === "CẤU HÌNH",
    );
    const majorEntry = configurationSection?.items.find(
      (item) => item.title === "Danh mục tuyển sinh",
    );

    expect(majorEntry).toMatchObject({
      url: "/director/admin/majors",
    });
    expect(
      configurationSection?.items.find(
        (item) => item.title === "Cấu hình điểm tiềm năng",
      ),
    ).toMatchObject({ url: "/director/admin/catalogs" });
  });
});
