import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { CRMTask } from "@/services/api/crm-tasks";
import SegmentTaskCard from "./segment-task-card";

const assignedTo = "tDBvbDwI3GhGtff632IgoybqLjtPwjH6";
const task: CRMTask = {
  name: "TASK-1",
  title: "Segment task",
  assignedTo,
  referenceDoctype: "CRM Segment",
  referenceDocname: "SEG-1",
};

function renderCard(
  assignedTask = task,
  assignees = [
    {
      name: assignedTo,
      full_name: "QA Tư vấn viên",
      email: "qa@example.com",
    },
  ],
) {
  return renderToStaticMarkup(
    <SegmentTaskCard
      task={assignedTask}
      assignees={assignees}
      canUpdate={false}
      canDelete={false}
      isActionPending={false}
      onEdit={() => {}}
      onDelete={() => {}}
      onToggleStatus={() => {}}
      onStatusChange={() => {}}
      onPriorityChange={() => {}}
    />,
  );
}

describe("Segment task assignee display", () => {
  it("shows the user's name in header and details, with name initials instead of the ID", () => {
    const markup = renderCard();
    expect(markup.match(/QA Tư vấn viên/g)).toHaveLength(2);
    expect(markup).toContain(">VV</span>");
    expect(markup).not.toContain(assignedTo);
    expect(task.assignedTo).toBe(assignedTo);
  });

  it("uses email when a known user has no display name", () => {
    expect(
      renderCard(task, [
        { name: assignedTo, full_name: " ", email: "qa@example.com" },
      ]),
    ).toContain("qa@example.com");
  });

  it("does not expose the ID when the assignee cannot be resolved", () => {
    const markup = renderCard(task, []);
    expect(markup).not.toContain(assignedTo);
    expect(markup).toContain("Người dùng không khả dụng");
    expect(markup).toContain(">—</span>");
  });

  it("keeps an unassigned task distinct from an unavailable user", () => {
    const markup = renderCard({ ...task, assignedTo: undefined });
    expect(markup).toContain("Chưa phân công");
    expect(markup).toContain("Cần phân công");
    expect(markup).toContain(">—</span>");
  });
});
