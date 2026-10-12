import { NestApiError } from "@/services/api/nest/nest-client";
import type {
  TaskReminderForm,
  TaskReminderSettings,
} from "@/services/api/task-reminder-settings";

export type ReminderFieldErrors = Partial<
  Record<keyof TaskReminderForm | "to" | "html", string>
>;

export function formFromSettings(
  settings: TaskReminderSettings,
): TaskReminderForm {
  return {
    enabled: settings.enabled,
    senderEmail: settings.senderEmail ?? "",
    senderName: settings.senderName ?? "",
    appPassword: "",
    sendTime: settings.sendTime,
    hoursBefore: settings.hoursBefore,
  };
}

export function validateEmail(value: string): string | undefined {
  const email = value.trim();
  return email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? "Nhập địa chỉ email hợp lệ, tối đa 254 ký tự."
    : undefined;
}

export function requiresAppPassword(
  form: TaskReminderForm,
  settings: TaskReminderSettings,
): boolean {
  return (
    !settings.passwordConfigured ||
    form.senderEmail.trim() !== settings.senderEmail
  );
}

export function validateReminderForm(
  form: TaskReminderForm,
  settings: TaskReminderSettings,
): ReminderFieldErrors {
  const errors: ReminderFieldErrors = {};
  const emailError = validateEmail(form.senderEmail);
  if (emailError) errors.senderEmail = emailError;
  const name = form.senderName.trim();
  if (!name || name.length > 191)
    errors.senderName = "Nhập tên hiển thị từ 1 đến 191 ký tự.";
  const password = form.appPassword.trim();
  if (!password && requiresAppPassword(form, settings))
    errors.appPassword =
      "Nhập mật khẩu ứng dụng của Gmail gửi để lưu cấu hình.";
  else if (password && (password.length < 8 || password.length > 256))
    errors.appPassword = "Mật khẩu ứng dụng cần từ 8 đến 256 ký tự.";
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(form.sendTime))
    errors.sendTime = "Chọn giờ gửi hợp lệ theo định dạng HH:mm.";
  if (
    !Number.isInteger(form.hoursBefore) ||
    form.hoursBefore < 1 ||
    form.hoursBefore > 168
  )
    errors.hoursBefore = "Nhập số giờ nguyên từ 1 đến 168.";
  return errors;
}

const ERROR_MESSAGES: Record<string, string> = {
  EMAIL_APP_PASSWORD_REQUIRED:
    "Khi đổi Gmail gửi, hãy nhập mật khẩu ứng dụng của Gmail mới.",
  EMAIL_NOT_CONFIGURED: "Hãy lưu Gmail và mật khẩu ứng dụng trước khi gửi thử.",
  EMAIL_SEND_FAILED:
    "Không thể gửi email thử. Hãy kiểm tra Gmail và mật khẩu ứng dụng.",
  EMAIL_SETTINGS_KEY_MISSING:
    "Máy chủ chưa sẵn sàng để lưu cấu hình email. Vui lòng liên hệ quản trị hệ thống.",
  EMAIL_SETTINGS_UNREADABLE:
    "Không đọc được cấu hình email đã lưu. Hãy nhập lại mật khẩu ứng dụng và lưu cấu hình.",
  INVALID_INPUT: "Kiểm tra lại các trường thông tin trước khi tiếp tục.",
};

export function reminderError(error: unknown): {
  message: string;
  fields: ReminderFieldErrors;
  requestId?: string;
} {
  const fields: ReminderFieldErrors = {};
  if (!(error instanceof NestApiError))
    return { message: "Không thể xử lý yêu cầu. Vui lòng thử lại.", fields };
  for (const issue of error.details) {
    if (
      [
        "senderEmail",
        "senderName",
        "appPassword",
        "sendTime",
        "hoursBefore",
        "to",
        "html",
      ].includes(issue.field)
    )
      fields[issue.field as keyof ReminderFieldErrors] = issue.message;
  }
  if (
    error.code === "EMAIL_APP_PASSWORD_REQUIRED" ||
    error.code === "EMAIL_SETTINGS_UNREADABLE"
  )
    fields.appPassword = ERROR_MESSAGES[error.code];
  const message =
    error.status === 401
      ? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
      : error.status === 403
        ? "Tài khoản không có quyền cấu hình hệ thống."
        : (ERROR_MESSAGES[error.code] ??
          "Không thể xử lý yêu cầu. Vui lòng thử lại hoặc liên hệ quản trị hệ thống.");
  return { message, fields, requestId: error.requestId };
}

export function formatReminderDate(value: string | null): string {
  if (!value) return "Chưa có lần chạy nào";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Chưa có thông tin"
    : new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: "Asia/Ho_Chi_Minh",
      }).format(date);
}
