import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { SaleTask } from "@/services/api/sale";
import PriorityTaskList from "./priority-task-list";
import TaskDetailPanel from "./task-detail-panel";

const task: SaleTask = {
  id: "task-id",
  studentId: "student-id",
  studentName: "QA Học sinh",
  title: "QA follow-up",
  type: "other",
  startAt: null,
  dueAt: null,
  context:
    "<p>Ghi chú <strong>in đậm</strong>, <em>in nghiêng</em>, <u>gạch chân</u></p><script>alert(1)</script>",
  priority: "Medium",
  status: "Todo",
  isOverdue: false,
};

describe("Sale task description previews", () => {
  it("preserves safe formatting in dashboard priority rows", () => {
    const html = renderToStaticMarkup(
      <PriorityTaskList
        tasks={[task]}
        onOpenTask={() => {}}
        timezone="Asia/Ho_Chi_Minh"
        referenceDate="2026-10-13"
        emptyMessage=""
      />,
    );
    expect(html).toMatch(/<strong[^>]*>in đậm<\/strong>/);
    expect(html).toMatch(/<em[^>]*>in nghiêng<\/em>/);
    expect(html).toMatch(/<u[^>]*>gạch chân<\/u>/);
    expect(html).not.toContain("alert(1)");
    expect(task.context).toContain("<strong>in đậm</strong>");
  });
  it("preserves safe formatting in the detail panel without modifying the source", () => {
    const html = renderToStaticMarkup(
      <TaskDetailPanel
        task={task}
        timezone="Asia/Ho_Chi_Minh"
        referenceDate="2026-10-13"
      />,
    );
    expect(html).toMatch(/<strong[^>]*>in đậm<\/strong>/);
    expect(html).toMatch(/<em[^>]*>in nghiêng<\/em>/);
    expect(html).toMatch(/<u[^>]*>gạch chân<\/u>/);
    expect(html).not.toContain("alert(1)");
    expect(task.context).toContain("<strong>in đậm</strong>");
  });
});
