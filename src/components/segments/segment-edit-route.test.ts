import { describe, expect, it } from "vitest";
import { getSegmentEditHref } from "./segment-list-types";

describe("Segment row edit routes", () => {
  const segment = { id: "internal-id", segmentCode: "SEG-001" };
  it.each([
    ["/sale/next-best-action", "/sale/segments/edit/SEG-001"],
    ["/lead-sale/segments", "/lead-sale/segments/edit/SEG-001"],
    ["/director/admin/segments", "/director/admin/segments/edit/SEG-001"],
  ])("resolves an existing editor for %s", (base, expected) => {
    expect(getSegmentEditHref(base, segment)).toBe(expected);
  });
  it("does not invent editors for routes that do not have one", () => {
    expect(getSegmentEditHref("/ctv-sale/segments", segment)).toBeUndefined();
  });
});
