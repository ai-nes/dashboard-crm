import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { TaskManagementItem } from "@/services/api/tasks/types";

import TaskDetailProperties from "./task-detail-properties";

const task: TaskManagementItem = {
  id: "task-1",
  title: "Call student",
  assignee: "Sales One",
  dueDate: "2026-10-12",
  status: "todo",
  priority: "Cao",
  actionCode: "CALL",
  studentId: "8f2d69d0-1795-4c52-a94a-e77c9ef64918",
  studentCode: "HS-2026-0001",
  studentName: "Nguyễn An",
  studentInitials: "NA",
  studentMajor: "CNTT",
};

describe("task student detail link", () => {
  it("navigates by student business code while keeping the task student id separate", () => {
    const html = renderToStaticMarkup(<TaskDetailProperties task={task} />);

    expect(html).toContain(
      'href="/director/students/HS-2026-0001?tab=activities&amp;taskId=task-1"',
    );
    expect(
      html,
    ).not.toContain('href="/director/students/8f2d69d0-1795-4c52-a94a-e77c9ef64918');
  });
});
