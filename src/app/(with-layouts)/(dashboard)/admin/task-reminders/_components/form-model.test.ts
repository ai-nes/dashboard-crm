import { describe, expect, it } from "vitest";
import {
  formFromSettings,
  validateReminderForm,
  validateEmail,
  reminderError,
} from "./form-model";
import { NestApiError } from "@/services/api/nest/nest-client";
import type { TaskReminderSettings } from "@/services/api/task-reminder-settings";

const settings: TaskReminderSettings = {
  id: "default",
  enabled: false,
  senderEmail: "sender@example.com",
  senderName: "CRM",
  smtpHost: "smtp.gmail.com",
  passwordConfigured: true,
  sendTime: "08:00",
  timeZone: "Asia/Ho_Chi_Minh",
  hoursBefore: 24,
  lastRunStatus: null,
  lastRunAt: null,
  updatedAt: "2026-10-12T01:00:00Z",
};
describe("reminder form validation", () => {
  it("never prefills a stored password", () => {
    expect(formFromSettings(settings).appPassword).toBe("");
  });
  it("allows retaining a password only for the same saved sender", () => {
    const form = formFromSettings(settings);
    expect(validateReminderForm(form, settings)).toEqual({});
    expect(
      validateReminderForm(
        { ...form, senderEmail: "other@example.com" },
        settings,
      ).appPassword,
    ).toBeTruthy();
    expect(
      validateReminderForm(form, { ...settings, passwordConfigured: false })
        .appPassword,
    ).toBeTruthy();
    expect(
      validateReminderForm(
        { ...form, senderEmail: " sender@example.com " },
        settings,
      ),
    ).toEqual({});
  });
  it.each([0, 169, 1.5, NaN])(
    "rejects invalid reminder hours %s",
    (hoursBefore) => {
      expect(
        validateReminderForm(
          { ...formFromSettings(settings), hoursBefore },
          settings,
        ).hoursBefore,
      ).toBeTruthy();
    },
  );
  it.each(["24:00", "8:00", "08:60", ""])(
    "rejects invalid time %s",
    (sendTime) => {
      expect(
        validateReminderForm(
          { ...formFromSettings(settings), sendTime },
          settings,
        ).sendTime,
      ).toBeTruthy();
    },
  );
  it("validates names, emails and replacement password lengths", () => {
    expect(validateEmail("bad")).toBeTruthy();
    expect(validateEmail(`${"x".repeat(250)}@example.com`)).toBeTruthy();
    const form = formFromSettings(settings);
    expect(
      validateReminderForm({ ...form, senderName: " " }, settings).senderName,
    ).toBeTruthy();
    expect(
      validateReminderForm(
        { ...form, senderName: "x".repeat(192), appPassword: "short" },
        settings,
      ),
    ).toHaveProperty("appPassword");
    expect(
      validateReminderForm({ ...form, appPassword: "x".repeat(257) }, settings)
        .appPassword,
    ).toBeTruthy();
  });
  it("keeps operational failures friendly without leaking SMTP details", () => {
    expect(
      reminderError(
        new NestApiError(503, "EMAIL_SEND_FAILED", "SMTP secret raw trace"),
      ).message,
    ).not.toContain("SMTP secret");
    expect(
      reminderError(
        new NestApiError(400, "EMAIL_APP_PASSWORD_REQUIRED", "required"),
      ).fields.appPassword,
    ).toBeTruthy();
    expect(
      reminderError(
        new NestApiError(
          400,
          "INVALID_INPUT",
          "invalid",
          [{ field: "hoursBefore", code: "too_big", message: "At most 168" }],
          "trace",
        ),
      ).fields.hoursBefore,
    ).toBe("At most 168");
    expect(
      reminderError(new NestApiError(401, "HTTP_401", "raw")).message,
    ).toContain("đăng nhập");
    expect(
      reminderError(new NestApiError(403, "FORBIDDEN", "raw")).message,
    ).toContain("quyền");
  });
});
