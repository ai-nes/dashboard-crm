import { describe, expect, it } from "vitest";

import {
  getCurrentPath,
  resolveReturnTo,
  withReturnTo,
} from "./detail-navigation";

describe("detail navigation", () => {
  it("keeps the source path and query when building a current path", () => {
    expect(
      getCurrentPath(
        "/lead-sale/campaigns/CAM-001",
        new URLSearchParams({ view: "students" }),
      ),
    ).toBe("/lead-sale/campaigns/CAM-001?view=students");
  });

  it("adds an encoded return path without dropping detail query parameters", () => {
    const href = withReturnTo(
      "/director/students/STU-001?tab=decision",
      "/lead-sale/campaigns/CAM-001?view=students",
    );
    const url = new URL(href, "https://ai-nes.internal");

    expect(url.pathname).toBe("/director/students/STU-001");
    expect(url.searchParams.get("tab")).toBe("decision");
    expect(url.searchParams.get("returnTo")).toBe(
      "/lead-sale/campaigns/CAM-001?view=students",
    );
  });

  it("rejects external return paths", () => {
    expect(resolveReturnTo("https://evil.example/path", "/lead-sale/leads")).toBe(
      "/lead-sale/leads",
    );
    expect(resolveReturnTo("//evil.example/path", "/lead-sale/leads")).toBe(
      "/lead-sale/leads",
    );
  });
});
