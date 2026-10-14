import { describe, expect, it } from "vitest";

import {
  getSegmentDetailHref,
  getSegmentStatusOptions,
  toSegmentListItem,
} from "./segment-list-types";

describe("segment list mapping", () => {
  it("uses the backend segment code instead of the document name", () => {
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

  it("keeps the UUID out of visible code and title fallbacks", () => {
    const result = toSegmentListItem({
      name: "550e8400-e29b-41d4-a716-446655440000",
      segment_code: "",
      title: "",
      status: "draft",
      revision: 0,
    });

    expect(result.id).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(result.segmentCode).toBe("");
    expect(result.name).toBe("—");
    expect(getSegmentDetailHref("/sale/segments", result)).toBe(
      "/sale/segments/550e8400-e29b-41d4-a716-446655440000",
    );
  });

  it("uses the business code in the detail URL and keeps UUID as the record id", () => {
    const result = toSegmentListItem({
      name: "550e8400-e29b-41d4-a716-446655440000",
      segment_code: "SEG-2026-0042",
      title: "Tiềm năng cao",
      status: "draft",
      revision: 0,
    });

    expect(result.id).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(getSegmentDetailHref("/sale/segments/", result)).toBe(
      "/sale/segments/SEG-2026-0042",
    );
  });

  it("uses the resolved creator label instead of showing the owner id", () => {
    const result = toSegmentListItem({
      name: "segment-id",
      segment_code: "SEG-2026-0042",
      title: "Tiềm năng cao",
      owner: "user-id",
      owner_name: "Nguyễn An",
      status: "draft",
      revision: 0,
    });

    expect(result.creator).toBe("Nguyễn An");
  });

  it("offers a restore transition for archived segments", () => {
    const options = getSegmentStatusOptions("archive").map(
      (option) => option.value,
    );

    expect(options).toContain("inactive");
    expect(options).toContain("archive");
    expect(options).not.toContain("active");
  });
});
