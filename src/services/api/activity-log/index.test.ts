import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.fn();

function json(body: unknown) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

describe("activity log response normalization", () => {
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

  it("keeps the actor name returned by the Nest API", async () => {
    fetchMock.mockImplementation(() =>
      json({
        logs: [
          {
            eventId: "auth:1",
            owner: "user-1",
            ownerFullName: "Local Admin",
            occurredAt: "2026-10-12T05:20:00.000Z",
          },
        ],
        total: 1,
        start: 0,
        pageLength: 8,
      }),
    );

    const { getActivityLogs } = await import("./index");
    const result = await getActivityLogs({ module: "auth" });

    expect(result.logs[0]).toMatchObject({
      owner: "user-1",
      ownerFullName: "Local Admin",
    });
  });
});
