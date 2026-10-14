import { describe, expect, it } from "vitest";
import { NestApiError } from "@/services/api/nest/nest-client";
import { formatDialogError } from "./dialog-error";

describe("backend reasons displayed in dialogs", () => {
  it("shows the exact identity conflict field and cause returned by BE", () => {
    const error = new NestApiError(
      409,
      "LEAD_IDENTITY_CONFLICT",
      "Email đang trùng với nhiều hồ sơ học sinh.",
      [
        {
          field: "email",
          code: "duplicate",
          message:
            "Email này đang trùng với 2 hồ sơ học sinh. Vui lòng kiểm tra lại email hoặc xử lý các hồ sơ trùng trước khi tạo Lead.",
        },
      ],
    );
    expect(formatDialogError(error, "Chưa thể tạo Lead.")).toBe(
      "Email đang trùng với nhiều hồ sơ học sinh.\nEmail: Email này đang trùng với 2 hồ sơ học sinh. Vui lòng kiểm tra lại email hoặc xử lý các hồ sơ trùng trước khi tạo Lead.",
    );
  });

  it("explains the actual Campaign validation response with field names and server constraints", () => {
    const error = new NestApiError(
      400,
      "INVALID_INPUT",
      "The request is invalid.",
      [
        {
          field: "admissionYear",
          code: "invalid_type",
          message: "Invalid input: expected int, received number",
        },
        {
          field: "campusId",
          code: "too_small",
          message: "Too small: expected string to have exactly 36 characters",
        },
      ],
    );
    expect(formatDialogError(error, "Không thể lưu chiến dịch.")).toBe(
      "Thông tin gửi lên chưa hợp lệ.\nNăm tuyển sinh: Phải là số nguyên.\nCampus: Phải gồm đúng 36 ký tự.",
    );
  });

  it("uses the limits returned by BE rather than a locally assumed limit", () => {
    const error = new NestApiError(
      400,
      "INVALID_INPUT",
      "The request is invalid.",
      [
        {
          field: "password",
          code: "too_small",
          message: "Too small: expected string to have >=8 characters",
        },
      ],
    );
    expect(formatDialogError(error, "Không thể lưu.")).toContain(
      "Mật khẩu: Phải có ít nhất 8 ký tự.",
    );
  });

  it("uses BE numeric bounds and allowed enum values verbatim", () => {
    const error = new NestApiError(
      400,
      "INVALID_INPUT",
      "The request is invalid.",
      [
        {
          field: "admissionYear",
          code: "too_big",
          message: "Too big: expected number to be <=2095",
        },
        {
          field: "status",
          code: "invalid_value",
          message: 'Invalid option: expected one of "DRAFT"|"ACTIVE"',
        },
      ],
    );
    expect(formatDialogError(error, "Không thể lưu.")).toContain(
      "Năm tuyển sinh: Giá trị phải nhỏ hơn hoặc bằng 2095.",
    );
    expect(formatDialogError(error, "Không thể lưu.")).toContain(
      'Trạng thái: Chỉ chấp nhận một trong các giá trị: "DRAFT", "ACTIVE".',
    );
  });

  it("preserves specific backend domain reasons and unknown field details", () => {
    const error = new NestApiError(
      400,
      "INVALID_CAMPAIGN_ROUTING_TEAM",
      "Team phải là Team Sales đang hoạt động thuộc Campus của chiến dịch.",
      [
        {
          field: "futureField",
          code: "INVALID",
          message: "Quy tắc mới do máy chủ trả về.",
        },
      ],
    );
    expect(formatDialogError(error, "Không thể lưu.")).toBe(
      "Team phải là Team Sales đang hoạt động thuộc Campus của chiến dịch.\nfutureField: Quy tắc mới do máy chủ trả về.",
    );
  });

  it("does not repeat the raw detail lines already appended by the Lead adapter", () => {
    const error = new NestApiError(
      400,
      "INVALID_INPUT",
      "The request is invalid.\nphone: Số điện thoại không hợp lệ.",
      [
        {
          field: "phone",
          code: "invalid",
          message: "Số điện thoại không hợp lệ.",
        },
      ],
    );
    expect(formatDialogError(error, "Không thể lưu.")).toBe(
      "Thông tin gửi lên chưa hợp lệ.\nSố điện thoại: Số điện thoại không hợp lệ.",
    );
  });

  it("uses contextual labels and retains errors without backend field details", () => {
    expect(
      formatDialogError(
        new NestApiError(400, "INVALID_INPUT", "The request is invalid.", [
          { field: "title", code: "invalid", message: "Tên đã được sử dụng." },
        ]),
        "Không thể lưu.",
        { title: "Tên chiến dịch" },
      ),
    ).toContain("Tên chiến dịch: Tên đã được sử dụng.");
    expect(
      formatDialogError(
        new Error("Không thể kết nối máy chủ CRM."),
        "Không thể lưu.",
      ),
    ).toBe("Không thể kết nối máy chủ CRM.");
    expect(formatDialogError(null, "Không thể lưu.")).toBe("Không thể lưu.");
  });
});
