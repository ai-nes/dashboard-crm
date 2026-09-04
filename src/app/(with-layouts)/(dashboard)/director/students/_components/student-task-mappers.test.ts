import { describe, expect, it } from "vitest";

import {
  crmTaskStatusToStudentStatus,
  studentTaskStatusToCrmStatus,
  studentTaskToUpdatePayload,
} from "./student-task-mappers";

describe("student task status mapping", () => {
  it.each([
    ["todo", "Todo"],
    ["in-progress", "In Progress"],
    ["done", "Done"],
    ["canceled", "Canceled"],
  ] as const)("gửi %s thành %s cho API", (uiStatus, apiStatus) => {
    expect(studentTaskStatusToCrmStatus(uiStatus)).toBe(apiStatus);
    expect(
      studentTaskToUpdatePayload(
        "TASK-1",
        {
          id: "TASK-1",
          title: "Theo dõi hồ sơ",
          assignee: "Nguyễn Văn A",
          dueDate: "05/09/2026",
          status: "todo",
          priority: "Trung bình",
        },
        { status: uiStatus },
      ).status,
    ).toBe(apiStatus);
  });

  it("đọc Backlog của API thành trạng thái Cần làm trên UI", () => {
    expect(crmTaskStatusToStudentStatus("Backlog")).toBe("todo");
  });
});
