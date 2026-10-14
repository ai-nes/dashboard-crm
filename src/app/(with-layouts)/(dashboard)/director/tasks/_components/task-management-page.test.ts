import { describe, expect, it } from "vitest";
import * as taskManagementPage from "./task-management-page";

describe("task list query page length", () => {
  it("loads enough tasks for the table count to match API totals above the kanban lane page size", () => {
    expect(
      taskManagementPage.getTaskManagementQueryPageLength?.("table", 1),
    ).toBe(100);
    expect(
      taskManagementPage.getTaskManagementQueryPageLength?.("kanban", 1),
    ).toBe(20);
  });
});
