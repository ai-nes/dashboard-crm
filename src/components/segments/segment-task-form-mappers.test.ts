import { describe, expect, it } from "vitest";

import { segmentTaskFormValuesToUpdatePayload } from "./segment-task-form-mappers";

describe("segmentTaskFormValuesToUpdatePayload", () => {
  it("preserves the saved times and precision when only the title changes", () => {
    const original = {
      startDate: "2026-10-11T05:15:00Z",
      dueDate: "2026-10-12T02:00:30.123Z",
    };
    const payload = segmentTaskFormValuesToUpdatePayload(
      {
        title: "Renamed",
        description: "",
        priority: "Medium",
        status: "Todo",
        startDate: "2026-10-11",
        dueDate: "2026-10-12",
        assignedTo: "",
      },
      original,
    );
    expect(payload.startDate).toBe(original.startDate);
    expect(payload.dueDate).toBe(original.dueDate);
  });
  it("preserves the existing local clock when changing the calendar date", () => {
    const payload = segmentTaskFormValuesToUpdatePayload(
      {
        title: "Task",
        description: "",
        priority: "Medium",
        status: "Todo",
        startDate: "2026-10-12",
        dueDate: "2026-10-13",
        assignedTo: "",
      },
      { startDate: "2026-10-11T05:15:00Z", dueDate: "2026-10-12T02:00:00Z" },
    );
    expect(payload.startDate).toBe("2026-10-12T12:15:00+07:00");
    expect(payload.dueDate).toBe("2026-10-13T09:00:00+07:00");
  });
  it("clears saved optional fields when the dialog values are blank", () => {
    expect(
      segmentTaskFormValuesToUpdatePayload({
        title: " Task 2 ",
        description: " Updated note ",
        priority: "Medium",
        status: "Todo",
        startDate: "",
        dueDate: "",
        assignedTo: "",
      }),
    ).toEqual({
      title: "Task 2",
      description: "Updated note",
      priority: "Medium",
      status: "Todo",
      startDate: null,
      dueDate: null,
      assignedTo: null,
    });
  });

  it("keeps values entered in the task form", () => {
    expect(
      segmentTaskFormValuesToUpdatePayload({
        title: "Task 2",
        description: "Updated note",
        priority: "High",
        status: "In Progress",
        startDate: "2026-10-12",
        dueDate: "2026-10-13",
        assignedTo: "user@example.test",
      }),
    ).toEqual({
      title: "Task 2",
      description: "Updated note",
      priority: "High",
      status: "In Progress",
      startDate: "2026-10-12T00:00:00+07:00",
      dueDate: "2026-10-13T23:59:00+07:00",
      assignedTo: "user@example.test",
    });
  });
});
