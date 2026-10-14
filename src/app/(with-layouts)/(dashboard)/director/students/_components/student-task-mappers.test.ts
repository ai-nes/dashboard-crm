import { describe, expect, it } from "vitest";

import {
  crmTaskToStudentTask,
  crmTaskStatusToStudentStatus,
  studentTaskStatusToCrmStatus,
  studentTaskToCreatePayload,
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

  it("reads saved UTC deadlines in CRM's Vietnam timezone", () => {
    const task = crmTaskToStudentTask(
      {
        name: "TASK-1",
        title: "Nhắc hồ sơ",
        dueDate: "2026-10-13T16:59:00.000Z",
        status: "Todo",
        priority: "Medium",
      } as never,
      "Người phụ trách",
    );

    expect(task.dueDate).toBe("13/10/2026");
    expect(task.dueTime).toBe("23:59");
  });

  it("writes selected task deadlines as explicit CRM-local instants", () => {
    const payload = studentTaskToCreatePayload(
      {
        id: "TASK-1",
        title: "Nhắc hồ sơ",
        assignee: "Người phụ trách",
        dueDate: "13/10/2026",
        dueTime: "23:59",
        status: "todo",
        priority: "Trung bình",
      },
      "student-1",
    );

    expect(payload.dueDate).toBe("2026-10-13T23:59:00+07:00");
  });
});
