import { describe, expect, it } from "vitest";

import {
  getInitialStudentDetailTab,
  shouldLoadInitialStudentInteractions,
} from "./student-detail-tab-state";

describe("student detail tab state", () => {
  it("keeps the initial page load focused on the overview", () => {
    expect(getInitialStudentDetailTab()).toBe("decision");
    expect(shouldLoadInitialStudentInteractions()).toBe(false);
  });

  it("loads interactions for supported interaction deep links", () => {
    expect(getInitialStudentDetailTab("calls")).toBe("interactions");
    expect(getInitialStudentDetailTab("activities")).toBe("interactions");
    expect(shouldLoadInitialStudentInteractions("zalo")).toBe(true);
  });

  it("does not load interactions when opening a task directly", () => {
    expect(getInitialStudentDetailTab("interactions", "TASK-1")).toBe("tasks");
    expect(shouldLoadInitialStudentInteractions("interactions", "TASK-1")).toBe(
      false,
    );
  });
});
