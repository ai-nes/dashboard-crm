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

describe("director overview with the Nest backend", () => {
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

  it("requests /api/v1/director/overview with the filters", async () => {
    fetchMock.mockImplementation(() => json({ unexpected: true }));
    const { getDirectorOverview } = await import("../director-overview");
    await expect(
      getDirectorOverview({
        admissionYear: 2026,
        scope: "all",
        trendRange: "7d",
      }),
    ).rejects.toMatchObject({ status: 502, code: "INVALID_OVERVIEW_RESPONSE" });
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://api.test/api/v1/director/overview?admissionYear=2026&scope=all&trendRange=7d",
    );
  });

  it("keeps the backend error code", async () => {
    fetchMock.mockImplementation(() =>
      json(
        { error: { code: "ADMISSION_YEAR_NOT_FOUND", message: "Không có" } },
        404,
      ),
    );
    const { getDirectorOverview } = await import("../director-overview");
    await expect(getDirectorOverview()).rejects.toMatchObject({
      status: 404,
      code: "ADMISSION_YEAR_NOT_FOUND",
    });
  });
});
