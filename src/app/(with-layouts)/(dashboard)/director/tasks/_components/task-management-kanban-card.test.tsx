import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { TaskManagementItem } from "@/services/api/tasks/types";

import TaskManagementKanbanCard from "./task-management-kanban-card";

vi.mock("@dnd-kit/react", () => ({
  useDraggable: () => ({ isDragging: false, handleRef: null, ref: null }),
}));

vi.mock("./task-management-kanban-title-editor", () => ({
  default: ({ title }: { title: string }) => <h3>{title}</h3>,
}));

vi.mock("./task-management-task-actions", () => ({ default: () => null }));

const task = {
  id: "task-1",
  title: "Gọi lại học sinh",
  assignee: "Tư vấn viên",
  dueDate: "2026-10-14",
  dueTime: "09:00",
  status: "todo",
  priority: "Trung bình",
  actionCode: "SEND_OBJECTION_CONTENT",
  taskType: "todo",
  studentId: "student-internal-id",
  studentCode: "HS-2026-0001",
  studentName: "Nguyễn Minh Anh",
  studentInitials: "NMA",
  studentMajor: "CNTT",
} as TaskManagementItem;

describe("TaskManagementKanbanCard task type", () => {
  it("keeps the full long task type readable and keyboard accessible", () => {
    const html = renderToStaticMarkup(
      <TaskManagementKanbanCard
        task={task}
        onOpenTask={() => undefined}
        canUpdateTask={false}
      />,
    );

    expect(html).toContain("Gửi thông tin giải đáp băn khoăn");
    expect(html).toContain('aria-label="Gửi thông tin giải đáp băn khoăn"');
    expect(html).toContain("whitespace-normal");
    expect(html).toContain("break-words");
  });
});
