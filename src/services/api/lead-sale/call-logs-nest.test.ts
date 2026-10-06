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

describe("lead call logs with the Nest backend", () => {
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

  it("reads call logs through the Nest route", async () => {
    fetchMock.mockImplementation(() =>
      json({
        data: {
          leadId: "lead-1",
          total: 1,
          calls: [
            {
              id: "call-1",
              time: "2026-10-06T07:00:00.000Z",
              direction: "outbound",
              outcome: "callback",
              callerName: "Tư vấn viên",
              receiverName: "Nguyễn An",
            },
          ],
        },
      }),
    );
    const { getLeadCallLogs } = await import("./call-logs");
    await expect(getLeadCallLogs("lead-1")).resolves.toMatchObject({
      leadId: "lead-1",
      total: 1,
      calls: [{ id: "call-1", outcome: "callback" }],
    });
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "http://api.test/api/v1/leads/lead-1/calls",
    );
  });

  it("creates a call log through the Nest route", async () => {
    fetchMock.mockImplementation(() =>
      json({
        data: {
          id: "call-2",
          time: "2026-10-06T07:00:00.000Z",
          direction: "inbound",
          outcome: "connected",
          callerName: "Tư vấn viên",
          receiverName: "Nguyễn An",
        },
      }),
    );
    const { createLeadCall } = await import("./call-logs");
    await expect(
      createLeadCall("lead-1", {
        direction: "inbound",
        outcome: "connected",
        durationSeconds: 30,
      }),
    ).resolves.toMatchObject({ id: "call-2", outcome: "connected" });
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toMatchObject({
      direction: "inbound",
      outcome: "connected",
      durationSeconds: 30,
    });
  });
});
