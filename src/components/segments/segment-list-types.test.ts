import { describe, expect, it } from "vitest";

import { toSegmentListItem } from "./segment-list-types";

describe("segment list mapping", () => {
  it("uses the backend segment code instead of the Frappe document name", () => {
    const result = toSegmentListItem({
      name: "a1b2c3d4",
      segment_code: "SEG-260909-7K4P2Q",
      title: "Tiềm năng cao",
      status: "draft",
      revision: 0,
    });

    expect(result.id).toBe("a1b2c3d4");
    expect(result.segmentCode).toBe("SEG-260909-7K4P2Q");
  });
});
