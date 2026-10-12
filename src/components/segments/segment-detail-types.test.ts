import { describe, expect, it } from "vitest";

import { toSegmentStudent } from "./segment-detail-types";

describe("segment student mapping", () => {
  it("shows the student code and keeps the UUID only as the record id", () => {
    expect(
      toSegmentStudent({
        name: "550e8400-e29b-41d4-a716-446655440000",
        student_code: "STU-2026-0042",
        full_name: "Nguyễn An",
      }),
    ).toMatchObject({
      id: "550e8400-e29b-41d4-a716-446655440000",
      code: "STU-2026-0042",
      name: "Nguyễn An",
    });
  });

  it("uses placeholders instead of exposing UUIDs when display fields are missing", () => {
    expect(
      toSegmentStudent({
        name: "550e8400-e29b-41d4-a716-446655440000",
        student_code: "STU-2026-0042",
      }),
    ).toMatchObject({
      id: "550e8400-e29b-41d4-a716-446655440000",
      code: "STU-2026-0042",
      name: "—",
    });
  });

  it("uses the resolved owner name instead of the student owner id", () => {
    expect(
      toSegmentStudent({
        name: "student-id",
        student_code: "STU-2026-0042",
        assigned_to: "user-id",
        assigned_to_name: "Nguyễn An",
      }),
    ).toMatchObject({ owner: "Nguyễn An" });
  });

  it("shows a clear fallback when a student owner cannot be resolved", () => {
    expect(
      toSegmentStudent({
        name: "student-id",
        student_code: "STU-2026-0042",
        assigned_to: "user-id",
      }),
    ).toMatchObject({ owner: "Không xác định" });
  });
});
