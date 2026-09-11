import { describe, expect, it } from "vitest";

import type { CRMTask } from "@/services/api/crm-tasks";

import {
  getSegmentTaskDeadlineStatus,
  groupSegmentTasks,
  isSegmentTaskOverdue,
} from "./segment-task-utils";

function task(overrides: Partial<CRMTask>): CRMTask {
  return {
    name: "TASK-1",
    title: "Task segment",
    referenceDoctype: "CRM Segment",
    referenceDocname: "SEG-1",
    ...overrides,
  };
}

describe("segment task deadline helpers", () => {
  const now = new Date(2026, 8, 9, 10).getTime();

  it("marks an unfinished task with a past due date as overdue", () => {
    const item = task({ dueDate: "08/09/2026", status: "Todo" });

    expect(isSegmentTaskOverdue(item, now)).toBe(true);
    expect(getSegmentTaskDeadlineStatus(item, now)).toMatchObject({
      tone: "overdue",
      label: "Quá hạn",
    });
  });

  it("does not mark completed tasks as overdue", () => {
    const item = task({ dueDate: "01/09/2026", status: "Done" });

    expect(isSegmentTaskOverdue(item, now)).toBe(false);
    expect(getSegmentTaskDeadlineStatus(item, now).tone).toBe("complete");
  });

  it("groups tasks by due date and puts overdue work first", () => {
    const groups = groupSegmentTasks([
      task({ name: "upcoming", dueDate: "12/09/2026", status: "Todo" }),
      task({ name: "overdue", dueDate: "08/09/2026", status: "Todo" }),
    ]);

    expect(groups.map((group) => group.id)).toEqual(["overdue", "2026-8-12"]);
  });
});
