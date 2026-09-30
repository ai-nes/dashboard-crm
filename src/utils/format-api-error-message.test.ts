import { describe, expect, it } from "vitest";

import { TeamManagementApiError } from "@/services/api/lead-sale/team-management";
import { formatApiErrorMessage } from "./format-api-error-message";

describe("formatApiErrorMessage", () => {
  it("removes the exception prefix from team management errors", () => {
    const message = "Không thể gỡ người cuối cùng có thể nhận Lead khỏi Team đang hoạt động.";
    const error = new TeamManagementApiError(
      417,
      "VALIDATION_ERROR",
      `frappe.exceptions.ValidationError: ${message}`,
    );
    expect(error.message).toBe(message);
    expect(error.status).toBe(417);
    expect(error.code).toBe("VALIDATION_ERROR");
  });

  it.each([
    ["frappe.exceptions.PermissionError: Không có quyền.", "Không có quyền."],
    ["frappe.exceptions.ValidationError: Thiếu dữ liệu: tên Team.", "Thiếu dữ liệu: tên Team."],
    ["Lỗi: Team đang hoạt động.", "Lỗi: Team đang hoạt động."],
    ["Không thể lưu thay đổi.", "Không thể lưu thay đổi."],
    ["", ""],
  ])("formats %s without removing message content", (input, expected) => {
    expect(formatApiErrorMessage(input)).toBe(expected);
  });
});
