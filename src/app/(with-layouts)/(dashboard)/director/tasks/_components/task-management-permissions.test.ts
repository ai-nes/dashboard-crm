import { describe, expect, it } from "vitest";
import type { CurrentUser } from "@/services/api/auth";
import type { TaskManagementItem } from "@/services/api/tasks/types";
import { canManageTaskRecord } from "./task-management-permissions";

const user: CurrentUser = {
  user: "owner@example.test",
  crm_user_id: "user-1",
  email: "owner@example.test",
  full_name: "Owner",
  user_image: null,
  roles: [],
  crm_profile: null,
  crm_role: null,
  crm_capabilities: [],
};

const task = {
  ownerId: "creator@example.test",
  assigneeId: "owner@example.test",
} as TaskManagementItem;

describe("task record ownership permissions", () => {
  it("allows the creator or assignee and the centralized team-oversee capability", () => {
    expect(canManageTaskRecord(user, { ...task, assigneeId: "owner@example.test" })).toBe(true);
    expect(canManageTaskRecord(user, { ...task, ownerId: "owner@example.test", assigneeId: "other@example.test" })).toBe(true);
    expect(canManageTaskRecord({ ...user, crm_capabilities: ["team.oversee"] }, { ...task, ownerId: "other@example.test", assigneeId: "other@example.test" })).toBe(true);
  });

  it("denies unrelated tasks even when the user has a task DocType grant", () => {
    expect(canManageTaskRecord(user, { ...task, ownerId: "other@example.test", assigneeId: "other@example.test" })).toBe(false);
    expect(canManageTaskRecord(null, task)).toBe(false);
  });
});
