import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.fn();

function json(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

describe("notifications Nest transport", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "http://api.test");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("lists caller notifications and unread count", async () => {
    fetchMock.mockImplementation(() =>
      json({
        data: {
          unreadCount: 1,
          notifications: [
            {
              id: "n-1",
              type: "Assignment",
              title: "Bạn được giao một task",
              message: "Task đã được giao cho bạn.",
              read: false,
              createdAt: "2026-10-06T08:00:00.000Z",
            },
          ],
        },
      }),
    );
    const { getCrmNotifications } = await import("./notifications");
    await expect(getCrmNotifications({ limit: 20 })).resolves.toMatchObject({
      unreadCount: 1,
      notifications: [{ id: "n-1", read: false }],
    });
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "http://api.test/api/v1/notifications?limit=20",
    );
  });

  it("marks one notification and all notifications as read", async () => {
    fetchMock.mockImplementation(() =>
      json({ data: { id: "n-1", read: true } }),
    );
    const { markCrmNotificationRead, markAllCrmNotificationsRead } =
      await import("./notifications");
    await markCrmNotificationRead("n-1");
    await markAllCrmNotificationsRead();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toBe(
      "http://api.test/api/v1/notifications/n-1/read",
    );
    expect(fetchMock.mock.calls[1][0]).toBe(
      "http://api.test/api/v1/notifications/read-all",
    );
  });
});
