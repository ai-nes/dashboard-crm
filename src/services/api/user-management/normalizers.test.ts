import { describe, expect, it } from "vitest";
import { normalizeCrmUser } from "./normalizers";

describe("User campus normalization", () => {
  it("preserves the actual campus returned by the API", () => {
    const campus = { id: "hcm", name: "FPTU Ho Chi Minh Campus", code: "HCM" };
    expect(normalizeCrmUser({ name: "u1", campus })).toMatchObject({ campus });
  });

  it("keeps missing or malformed campus data unassigned", () => {
    for (const campus of [undefined, null, "HCM", {}, { id: "hcm" }]) {
      expect(normalizeCrmUser({ name: "u1", campus })).toMatchObject({
        campus: null,
      });
    }
  });
});
