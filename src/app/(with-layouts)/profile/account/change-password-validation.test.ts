import { describe, expect, it } from "vitest";
import { validatePasswordChange } from "./change-password-validation";

describe("password change validation", () => {
  it("requires current password and a matching new password of 6 to 128 characters", () => {
    expect(validatePasswordChange("", "abcdef", "abcdef")).toContain(
      "hiện tại",
    );
    expect(validatePasswordChange("current", "abcde", "abcde")).toContain("6");
    expect(
      validatePasswordChange("current", "x".repeat(129), "x".repeat(129)),
    ).toContain("128");
    expect(validatePasswordChange("current", "abcdef", "different")).toContain(
      "khớp",
    );
    expect(validatePasswordChange("abcdef", "abcdef", "abcdef")).toContain(
      "khác",
    );
    expect(validatePasswordChange("current", "abcdef", "abcdef")).toBeNull();
    expect(
      validatePasswordChange("current", "x".repeat(128), "x".repeat(128)),
    ).toBeNull();
  });
});
