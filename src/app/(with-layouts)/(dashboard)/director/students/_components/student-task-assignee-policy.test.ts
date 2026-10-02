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
    roles: ["Sale"],
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

  it("resolves by linked User when the Staff display name differs", () => {
    expect(
      resolveStudentTaskAssignee("Sale", assignees, "sale@example.com"),
    ).toBe(assignees[0]);
  });

  it("uses the linked User to distinguish accounts with the same display name", () => {
    const duplicate = {
      ...assignees[0],
      name: "other@example.com",
      email: "other@example.com",
    };
    const users = [duplicate, ...assignees];
    expect(
      resolveStudentTaskAssignee("Nguyễn Minh Anh", users, "sale@example.com"),
    ).toBe(assignees[0]);
    expect(resolveStudentTaskAssignee("Nguyễn Minh Anh", users)).toBeNull();
  });

  it("does not fall back to a different account when the linked User is unavailable", () => {
    expect(
      resolveStudentTaskAssignee("Nguyễn Minh Anh", assignees, null),
    ).toBeNull();
    expect(
      resolveStudentTaskAssignee(
        "Nguyễn Minh Anh",
        assignees,
        "missing@example.com",
      ),
    ).toBeNull();
  });

  it("keeps loading, error, and unassigned states blocked", () => {
    expect(
      getTaskAssignmentMessage("Sale", null, { isLoading: true }),
    ).toContain("Đang xác định");
    expect(
      getTaskAssignmentMessage("Sale", null, { hasError: true }),
    ).toContain("Không xác định");
    expect(resolveStudentTaskAssignee("Chưa phân công", assignees)).toBeNull();
    expect(getTaskAssignmentMessage("Sale", assignees[0])).toBeNull();
  });
});
