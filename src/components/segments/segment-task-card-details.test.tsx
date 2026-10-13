import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { CRMTask } from "@/services/api/crm-tasks";

import SegmentTaskCardDetails from "./segment-task-card-details";
import { getSegmentTaskDeadlineStatus } from "./segment-task-utils";

describe("SegmentTaskCardDetails description preview", () => {
  it("renders stored task HTML with safe formatting and unchanged source", () => {
    const task: CRMTask = {
      name: "TASK-1",
      title: "Segment task",
      description:
        "<p>Segment <strong>bold</strong>, <em>italic</em>, <u>underlined</u> &amp; safe</p><script>alert(1)</script>",
      referenceDoctype: "CRM Segment",
      referenceDocname: "SEG-1",
    };

    const markup = renderToStaticMarkup(
      <SegmentTaskCardDetails
        task={task}
        assigneeName="Chưa phân công"
        assigneeInitials="—"
        deadlineStatus={getSegmentTaskDeadlineStatus(task)}
      />,
    );

    expect(markup).toMatch(/<strong[^>]*>bold<\/strong>/);
    expect(markup).toMatch(/<em[^>]*>italic<\/em>/);
    expect(markup).toMatch(/<u[^>]*>underlined<\/u>/);
    expect(markup).toContain("&amp; safe");
    expect(markup).not.toContain("&lt;p&gt;");
    expect(markup).not.toContain("alert(1)");
    expect(task.description).toContain("<strong>bold</strong>");
    expect(task.description).toContain("<script>alert(1)</script>");
  });
});
