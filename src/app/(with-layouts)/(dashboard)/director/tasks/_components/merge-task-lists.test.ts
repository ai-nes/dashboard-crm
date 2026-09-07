import { describe, expect, it } from "vitest";
import type { CRMTask } from "@/services/api/crm-tasks";
import { mergeTaskLists } from "./merge-task-lists";

const task: CRMTask = {
  name: "ACT-2026-00001",
  title: "Liên hệ học sinh",
  referenceDoctype: "CRM Student",
  referenceDocname: "STUDENT-1",
  status: "Todo",
};

describe("mergeTaskLists", () => {
  it("deduplicates within and across lanes, retaining distinct tasks in order", () => {
    const other = { ...task, name: "ACT-2026-00002" };
    expect(mergeTaskLists([[task, task, other], [task], []])).toEqual([task, other]);
  });

  it("keeps the newest status regardless of lane order", () => {
    const older = { ...task, modified: "2026-09-07 09:00:00" };
    const newer: CRMTask = { ...task, status: "In Progress", modified: "2026-09-07 10:00:00" };
    expect(mergeTaskLists([[older], [newer]])).toEqual([newer]);
    expect(mergeTaskLists([[newer], [older]])).toEqual([newer]);
  });

  it("uses the later snapshot when timestamps are absent without mutating inputs", () => {
    const updated: CRMTask = { ...task, status: "Done" };
    const first = [task];
    expect(mergeTaskLists([first, [updated]])).toEqual([updated]);
    expect(first).toEqual([task]);
    expect(mergeTaskLists([])).toEqual([]);
  });
});
