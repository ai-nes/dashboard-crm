import { describe, expect, it } from "vitest";

import { getStudentInternalId } from "./student-identifiers";

describe("student internal identifiers", () => {
  it("prefers the canonical Student id over the linked record id", () => {
    expect(
      getStudentInternalId({
        id: "lead-record-id",
        studentId: "student-record-id",
      }),
    ).toBe("student-record-id");
  });

  it("falls back to the CRM record id when the canonical Student id is absent", () => {
    expect(
      getStudentInternalId({
        id: "student-record-id",
      }),
    ).toBe("student-record-id");
  });
});
