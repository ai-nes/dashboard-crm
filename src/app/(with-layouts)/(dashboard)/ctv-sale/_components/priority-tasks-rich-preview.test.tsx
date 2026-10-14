import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { CtvSalePriorityTask } from "@/services/api/ctv-sale";

import PriorityTasks from "./priority-tasks";

describe("CTV priority task descriptions", () => {
  it("preserves safe rich-text formatting without modifying the stored HTML", () => {
    const source =
      "<p>CTV <strong>bold</strong>, <em>italic</em>, <u>underlined</u></p><script>alert(1)</script>";
    const task: CtvSalePriorityTask = {
      id: "legacy-task-1",
      studentId: "student-1",
      studentName: "QA Student",
      taskType: "other",
      taskTypeLabel: "Công việc khác",
      dueAt: null,
      detail: source,
      priority: "medium",
      status: "todo",
      isOverdue: false,
    };
    const html = renderToStaticMarkup(
      <QueryClientProvider client={new QueryClient()}>
        <PriorityTasks
          tasks={[task]}
          overdueCount={0}
          timezone="Asia/Ho_Chi_Minh"
          onTaskCompleted={() => undefined}
        />
      </QueryClientProvider>,
    );

    expect(html).toMatch(/<strong[^>]*>bold<\/strong>/);
    expect(html).toMatch(/<em[^>]*>italic<\/em>/);
    expect(html).toMatch(/<u[^>]*>underlined<\/u>/);
    expect(html).not.toContain("alert(1)");
    expect(task.detail).toBe(source);
  });
});
