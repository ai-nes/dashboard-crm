import { describe, expect, it } from "vitest";

import type { CRMTask } from "@/services/api/crm-tasks";

import { crmTaskToManagementItem } from "./task-management-mappers";

describe("CRM task student display mapping", () => {
  it("shows scoped student metadata while preserving the UUID as the task reference", () => {
    const studentId = "7ae8933f-744e-4249-8680-c728ba0bf5de";
    const task = {
      name: "task-1",
      title: "QA follow up",
      student: studentId,
      referenceDoctype: "CRM Student",
      referenceDocname: studentId,
      studentName: "QA_20261013_Quan_Retest",
      studentCode: "HS-2026-HCM-002678",
    } as CRMTask;

    const item = crmTaskToManagementItem(task, [], []);

    expect(item.studentName).toBe("QA_20261013_Quan_Retest");
    expect(item.studentCode).toBe("HS-2026-HCM-002678");
    expect(item.studentId).toBe(studentId);
  });
});
