import { describe, expect, it } from "vitest";

import { getRuleVersionStatusOptions } from "./rule-version-status-options";

describe("getRuleVersionStatusOptions", () => {
  it("allows every transition for non-Active versions", () => {
    for (const status of ["draft", "testing", "archived"] as const) {
      expect(getRuleVersionStatusOptions(status)).toEqual([
        "draft",
        "testing",
        "archived",
        "active",
      ]);
    }
  });

  it("does not offer a transition away from the sole Active version", () => {
    expect(getRuleVersionStatusOptions("active")).toEqual(["active"]);
  });
});
