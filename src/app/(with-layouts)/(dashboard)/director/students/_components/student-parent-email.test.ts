import { describe, expect, it } from "vitest";

import { getStudentParentEmail } from "./student-parent-email";

describe("student parent email", () => {
  it("uses the parent contact email instead of the student's email", () => {
    expect(
      getStudentParentEmail({
        student: {
          email: "student@example.test",
          profileDetails: { contact: { email: "parent@example.test" } },
        },
      } as never),
    ).toBe("parent@example.test");
  });

  it("returns an empty value when no parent email exists", () => {
    expect(
      getStudentParentEmail({
        student: { email: "student@example.test", profileDetails: null },
      } as never),
    ).toBe("");
  });
});
