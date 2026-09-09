import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./multi-step-dialog.tsx", import.meta.url), "utf8");

describe("MultiStepDialog sizing contract", () => {
  it("keeps the default width and exposes an opt-in wide size", () => {
    expect(source).toContain('size?: "default" | "wide"');
    expect(source).toContain('size = "default"');
    expect(source).toContain('size === "wide"');
    expect(source).toContain("max-w-2xl");
  });
});
