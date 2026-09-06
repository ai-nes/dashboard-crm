import { describe, expect, it } from "vitest";
import { workflowSteps } from "./data";
import {
  getCurrentWorkflowPhaseId,
  getWorkflowPhaseState,
} from "./mappings";

function stepsWithStatuses(
  statuses: Array<"idle" | "running" | "success" | "warning" | "error">,
) {
  return workflowSteps.map((step, index) => ({
    ...step,
    status: statuses[index] ?? "idle",
  }));
}

describe("student assignment workflow phase flags", () => {
  it("points to a running phase before phases that need attention", () => {
    const steps = stepsWithStatuses([
      "success",
      "success",
      "running",
      "warning",
      "warning",
      "idle",
    ]);

    expect(getCurrentWorkflowPhaseId(steps)).toBe("classification");
    expect(getWorkflowPhaseState(steps[0], "classification")).toBe(
      "completed",
    );
    expect(getWorkflowPhaseState(steps[2], "classification")).toBe("current");
    expect(getWorkflowPhaseState(steps[3], "classification")).toBe(
      "attention",
    );
    expect(getWorkflowPhaseState(steps[5], "classification")).toBe("pending");
  });

  it("points to the first phase needing attention when no phase is running", () => {
    const steps = stepsWithStatuses([
      "success",
      "success",
      "success",
      "warning",
      "warning",
      "warning",
    ]);

    expect(getCurrentWorkflowPhaseId(steps)).toBe("matching");
  });

  it("has no current phase when every phase completed", () => {
    const steps = stepsWithStatuses([
      "success",
      "success",
      "success",
      "success",
      "success",
      "success",
    ]);

    expect(getCurrentWorkflowPhaseId(steps)).toBeNull();
  });
});
