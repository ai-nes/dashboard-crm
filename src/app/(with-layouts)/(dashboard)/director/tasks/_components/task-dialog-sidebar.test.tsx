import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import TaskDialogSidebar from "./task-dialog-sidebar";

describe("TaskDialogSidebar read-only task type", () => {
  it("shows a human label instead of the internal action code", () => {
    const html = renderToStaticMarkup(
      <TaskDialogSidebar
        status="todo"
        priority="Trung bình"
        actionCode="SEND_OBJECTION_CONTENT"
        dueDate="13/10/2026"
        dueTime="15:53"
      />,
    );

    expect(html).toContain("Gửi thông tin giải đáp băn khoăn");
    expect(html).toContain('aria-label="Gửi thông tin giải đáp băn khoăn"');
    expect(html).toContain('tabindex="0"');
    expect(html).toContain("whitespace-normal");
    expect(html).toContain("break-words");
    expect(html).not.toContain("SEND_OBJECTION_CONTENT");
  });
});
