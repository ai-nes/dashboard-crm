import { describe, expect, it } from "vitest";

import { getDefaultCampusOption } from "./default-campus";

describe("default creation campus", () => {
  it.each(["HCM", "FPTU-HCM", "Hồ Chí Minh", "Đại học FPT Hồ Chí Minh"])(
    "resolves %s to its catalog option instead of assuming a campus ID",
    (label) => {
      const hcm = { id: "actual-hcm-id", label };
      expect(getDefaultCampusOption([{ id: "hn", label: "Hà Nội" }, hcm])).toBe(hcm);
    },
  );

  it("leaves the default empty while loading or when HCM is unavailable", () => {
    expect(getDefaultCampusOption([])).toBeUndefined();
    expect(getDefaultCampusOption([{ id: "hn", label: "Hà Nội" }])).toBeUndefined();
  });
});
