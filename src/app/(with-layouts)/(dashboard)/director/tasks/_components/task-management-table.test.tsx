import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { TaskManagementItem } from "@/services/api/tasks/types";

import TaskManagementTable from "./task-management-table";

const task: TaskManagementItem = {
  id: "task-1",
  title: "QA responsive task",
  assignee: "Sales One",
  dueDate: "13/10/2026",
  status: "todo",
  priority: "Trung bình",
  studentId: "student-1",
  studentName: "QA Student",
  studentCode: "HS-2026-0001",
  studentInitials: "QS",
  studentMajor: "—",
};

describe("TaskManagementTable responsive title column", () => {
  it("keeps the task title readable and openable in a horizontally scrollable table", () => {
    const html = renderToStaticMarkup(
      <TaskManagementTable tasks={[task]} onOpenTask={() => undefined} />,
    );

    expect(html).toContain("overflow-x-auto");
    expect(html).toContain("min-w-[70rem]");
    expect(html).toContain("min-w-64");
    expect(html).toContain('type="button" title="QA responsive task"');
  });
});
