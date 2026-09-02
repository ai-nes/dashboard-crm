import { describe, expect, it } from "vitest";

import { CONTROL_LEVEL_COLOR, CONTROL_LEVEL_LABEL } from "./control-level";
import type { ActionControlLevel } from "./types";

const TIERS: ActionControlLevel[] = ["automatic", "review", "approval"];

describe("action control level", () => {
  it("covers every control tier", () => {
    for (const tier of TIERS) {
      expect(CONTROL_LEVEL_LABEL[tier]).toBeTruthy();
      expect(CONTROL_LEVEL_COLOR[tier]).toBeTruthy();
    }
  });

  it("escalates badge severity from automatic to approval", () => {
    expect(CONTROL_LEVEL_COLOR.automatic).toBe("success");
    expect(CONTROL_LEVEL_COLOR.review).toBe("warning");
    expect(CONTROL_LEVEL_COLOR.approval).toBe("error");
  });

  it("flags the approval tier as the one needing a reviewer", () => {
    expect(CONTROL_LEVEL_LABEL.approval).toContain("cần duyệt");
    expect(CONTROL_LEVEL_LABEL.automatic).toContain("tự động");
  });
});
