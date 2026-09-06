import { describe, expect, it } from "vitest";

import type { StudentTaskItem } from "@/services/api/students/types";

import {
  getAssigneeInitials,
  getTaskDeadlineStatus,
  getTaskDueAt,
} from "./task-card-utils";

const task: StudentTaskItem = {
  id: "task-1",
  title: "Gọi lại cho học sinh",
  assignee: "Dương Thị Bích Tuyền",
  dueDate: "06/09/2026",
  dueTime: "17:03",
  status: "todo",
  priority: "Cao",
};

describe("task-card-utils", () => {
  it("formats assignee initials from the last two name parts", () => {
    expect(getAssigneeInitials(task.assignee)).toBe("BT");
    expect(getAssigneeInitials("")).toBe("—");
  });

  it("classifies overdue and soon deadlines with semantic copy", () => {
    const dueAt = getTaskDueAt(task);
    expect(dueAt).not.toBeNull();

    expect(getTaskDeadlineStatus(task, dueAt! - 6 * 60 * 60 * 1000)).toEqual({
      tone: "soon",
      label: "Sắp đến hạn 6 giờ",
      detail: "Còn 6 giờ để xử lý",
    });
    expect(getTaskDeadlineStatus(task, dueAt! + 6 * 60 * 60 * 1000)).toEqual({
      tone: "overdue",
      label: "Quá hạn 6 giờ",
      detail: "Đã quá hạn 6 giờ",
    });
  });

  it("does not treat completed tasks as overdue", () => {
    expect(
      getTaskDeadlineStatus(
        { ...task, status: "done" },
        Number.MAX_SAFE_INTEGER,
      ).tone,
    ).toBe("complete");
  });
});
