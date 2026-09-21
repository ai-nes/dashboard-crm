import { describe, expect, it } from "vitest";

import {
  canTransitionStudentStatus,
  getStudentStatusOptions,
  isStudentStatusTerminal,
  studentStatusLabel,
  studentStatusOptions,
} from "./student-status";

describe("student status flow", () => {
  it("includes the registration stages in the canonical order", () => {
    expect(studentStatusOptions).toEqual([
      "New",
      "Attempting",
      "Connected",
      "Qualified",
      "Registration",
      "New Enter",
      "Disqualified",
    ]);
  });

  it("allows Qualified to progress through Registration to New Enter", () => {
    expect(getStudentStatusOptions("Qualified")).toEqual([
      "Qualified",
      "Registration",
    ]);
    expect(getStudentStatusOptions("Registration")).toEqual([
      "Registration",
      "New Enter",
    ]);
    expect(canTransitionStudentStatus("Qualified", "Registration")).toBe(true);
    expect(canTransitionStudentStatus("Registration", "New Enter")).toBe(true);
  });

  it("only allows Disqualified from Connected", () => {
    expect(canTransitionStudentStatus("Connected", "Disqualified")).toBe(true);
    expect(canTransitionStudentStatus("Attempting", "Disqualified")).toBe(false);
    expect(canTransitionStudentStatus("Qualified", "Disqualified")).toBe(false);
  });

  it("treats only New Enter and Disqualified as terminal", () => {
    expect(studentStatusLabel["New Enter"]).toBe("Nhập học");
    expect(isStudentStatusTerminal("Qualified")).toBe(false);
    expect(isStudentStatusTerminal("Registration")).toBe(false);
    expect(isStudentStatusTerminal("New Enter")).toBe(true);
    expect(isStudentStatusTerminal("Disqualified")).toBe(true);
  });
});
