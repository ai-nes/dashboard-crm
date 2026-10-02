import { describe, expect, it } from "vitest";

import { normalizeSearchValue } from "./normalize-search-value";

describe("Vietnamese dropdown search", () => {
  it.each(["Hồ Chí Minh", "ho chi minh", " HỒ CHÍ MINH "])(
    "finds Hồ Chí Minh with %s",
    (query) => {
      expect(normalizeSearchValue("Hồ Chí Minh")).toContain(
        normalizeSearchValue(query),
      );
    },
  );

  it("matches Vietnamese đ and decomposed accents", () => {
    expect(normalizeSearchValue("Đắk Lắk".normalize("NFD"))).toBe("dak lak");
  });
});
