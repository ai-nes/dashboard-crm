import { describe, expect, it } from "vitest";

import { createDefaultSegmentName } from "./segment-name";

describe("createDefaultSegmentName", () => {
  it("formats the creation timestamp in Vietnam time", () => {
    expect(createDefaultSegmentName(new Date("2026-09-08T21:24:15.000Z"))).toBe(
      "Segment chưa đặt tên · 09/09/2026 04:24:15",
    );
  });
});
