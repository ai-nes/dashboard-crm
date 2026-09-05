import { describe, expect, it } from "vitest";

import type { SessionUser } from "@/services/api/auth";

import {
  getTaskAssignmentMessage,
  normalizeStudentOwner,
  resolveStudentTaskAssignee,
} from "./student-task-assignee-policy";

const assignees: SessionUser[] = [
  {
    name: "sale@example.com",
    email: "sale@example.com",
    full_name: "Nguyễn Minh Anh",
    roles: ["Sales User"],
    crm_profile: "sales",
  },
  {
    name: "CTV-001",
    email: "ctv@example.com",
    full_name: "Trần Cộng Tác Viên",
    roles: ["CTV Sale"],
    crm_profile: "ctv_sale",
  },
];

describe("student task assignee policy", () => {
  it("treats empty and unassigned labels as students without an owner", () => {
    expect(normalizeStudentOwner(undefined)).toBeUndefined();
    expect(normalizeStudentOwner(" Chưa phân công ")).toBeUndefined();
    expect(normalizeStudentOwner("-")).toBeUndefined();
  });

  it("resolves the CRM account from the assigned display name", () => {
    expect(
      resolveStudentTaskAssignee("Nguyễn Minh Anh", assignees),
    ).toMatchObject({
      name: "sale@example.com",
      full_name: "Nguyễn Minh Anh",
    });
    expect(resolveStudentTaskAssignee("CTV-001", assignees)?.full_name).toBe(
      "Trần Cộng Tác Viên",
    );
  });

  it("returns a blocking message when the student is not assigned", () => {
    expect(getTaskAssignmentMessage("Chưa phân công", null)).toContain(
      "chưa thể tạo task",
    );
  });
});
