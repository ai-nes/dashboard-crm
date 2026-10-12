import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getTaskReminderSettings,
  updateTaskReminderSettings,
  sendTaskReminderTestEmail,
} from "./task-reminder-settings";
import { NestApiError } from "./nest/nest-client";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("task reminder settings transport", () => {
  it("reads settings with the existing session transport", async () => {
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "http://crm.test");
    const fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: { enabled: false },
          meta: { requestId: "read" },
        }),
      ),
    );
    vi.stubGlobal("fetch", fetch);
    expect(await getTaskReminderSettings()).toEqual({ enabled: false });
    expect(fetch).toHaveBeenCalledWith(
      "http://crm.test/api/v1/task-reminder-settings",
      expect.objectContaining({ credentials: "include", cache: "no-store" }),
    );
  });
  it("omits an empty password and read-only settings from PATCH", async () => {
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "http://crm.test");
    const fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ data: { passwordConfigured: true } })),
      );
    vi.stubGlobal("fetch", fetch);
    await updateTaskReminderSettings({
      enabled: true,
      senderEmail: " sender@example.com ",
      senderName: " CRM ",
      appPassword: " ",
      sendTime: "08:00",
      hoursBefore: 24,
    });
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({
      enabled: true,
      senderEmail: "sender@example.com",
      senderName: "CRM",
      sendTime: "08:00",
      hoursBefore: 24,
    });
  });
  it("sends a new password only when provided", async () => {
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "http://crm.test");
    const fetch = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ data: {} })));
    vi.stubGlobal("fetch", fetch);
    await updateTaskReminderSettings({
      enabled: false,
      senderEmail: "sender@example.com",
      senderName: "CRM",
      appPassword: " xxxx xxxx ",
      sendTime: "08:00",
      hoursBefore: 24,
    });
    expect(JSON.parse(fetch.mock.calls[0][1].body).appPassword).toBe(
      "xxxx xxxx",
    );
  });
  it("preserves backend error codes, field details and request IDs", async () => {
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "http://crm.test");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: {
              code: "INVALID_INPUT",
              message: "Invalid",
              details: [
                {
                  field: "senderEmail",
                  code: "invalid_format",
                  message: "Email invalid",
                },
              ],
              requestId: "trace",
            },
          }),
          { status: 400 },
        ),
      ),
    );
    await expect(
      sendTaskReminderTestEmail("test@example.com"),
    ).rejects.toMatchObject({
      status: 400,
      code: "INVALID_INPUT",
      requestId: "trace",
      details: [
        {
          field: "senderEmail",
          code: "invalid_format",
          message: "Email invalid",
        },
      ],
    } satisfies Partial<NestApiError>);
  });
  it("posts only the trimmed test recipient", async () => {
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "http://crm.test");
    const fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ data: { sent: true, to: "test@example.com" } }),
        ),
      );
    vi.stubGlobal("fetch", fetch);
    expect(await sendTaskReminderTestEmail(" test@example.com ")).toEqual({
      sent: true,
      to: "test@example.com",
    });
    expect(fetch).toHaveBeenCalledWith(
      "http://crm.test/api/v1/task-reminder-settings/test-email",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ to: "test@example.com" }),
      }),
    );
  });
});
