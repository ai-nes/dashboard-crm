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

describe("audit and activity logs with the Nest backend", () => {
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

  it("reads a student history and keeps the response shape", async () => {
    fetchMock.mockImplementation(() =>
      json({
        student: "HS-1",
        logs: [
          {
            eventId: "e1",
            action: "created",
            doctype: "CRM Student",
            docname: "HS-1",
            occurredAt: "2026-10-01T00:00:00.000Z",
            source: "Document",
            sourceName: "HS-1",
            category: "record",
          },
        ],
        total: 1,
        start: 0,
        pageLength: 100,
        readOnly: true,
      }),
    );
    const { getStudentAuditLogs } = await import("../student-audit");
    const result = await getStudentAuditLogs({ student: "HS-1" });
    expect(result).toMatchObject({ student: "HS-1", total: 1, readOnly: true });
    expect(result.logs[0]).toMatchObject({ eventId: "e1", category: "record" });
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "http://api.test/api/v1/students/HS-1/audit-logs?start=0&pageLength=100",
    );
  });

  it("sends activity filters as query parameters and maps errors", async () => {
    fetchMock.mockImplementationOnce(() =>
      json({ logs: [], total: 0, start: 0, pageLength: 50, module: "auth" }),
    );
    const { getActivityLogs, ActivityLogApiError } =
      await import("../activity-log");
    await getActivityLogs({ module: "auth", severity: "critical" });
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://api.test/api/v1/activity-logs?module=auth&severity=critical&start=0&pageLength=50",
    );
    fetchMock.mockImplementationOnce(() =>
      json({ error: { code: "FORBIDDEN", message: "Không có quyền" } }, 403),
    );
    await expect(getActivityLogs({ module: "all" })).rejects.toBeInstanceOf(
      ActivityLogApiError,
    );
  });
});
